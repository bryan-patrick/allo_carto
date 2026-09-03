import type { DeckChapter, DeckStory, StoryAtlas } from '@/data/french/storyAtlas';
import { storyAtlas } from '@/data/french/storyAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { ProgressById, Progression, ProgressType } from './progression';

/**
 * Typing
 */
interface AtlasCompletionItem {
	id: string;
	type: ProgressType;
	wordIds: string[];
}

interface GetAtlasItemsContainingWordProps {
	atlas?: StoryAtlas;
	wordId: string;
}

interface FindCompletionPathProps {
	atlas?: StoryAtlas;
	id: string;
}

interface IsItemUnlockedProps extends FindCompletionPathProps {
	progressById: ProgressById;
}

export interface UnlockCriteria {
	isUnlocked: boolean;
	requiredPercentage: number;
	title: string;
}

export interface AtlasChapterLocation {
	story: DeckStory;
	chapter: DeckChapter;
}

/**
 * Get the unique word ids from a group of decks.
 */
function getUniqueWordIds(decks: CardDeck[]): string[] {
	const uniqueWordIds = new Set<string>();

	for (const deck of decks) {
		for (const wordId of deck.wordIds) {
			uniqueWordIds.add(wordId);
		}
	}

	return Array.from(uniqueWordIds);
}

/**
 * Get every deck from every chapter in a story.
 */
function getStoryDecks(story: DeckStory): CardDeck[] {
	const storyDecks: CardDeck[] = [];

	for (const chapter of story.chapters) {
		storyDecks.push(...chapter.decks);
	}

	return storyDecks;
}

/**
 * Get every story, chapter, and deck with the words used to calculate its completion.
 */
export function getAtlasCompletionItems(atlas: StoryAtlas = storyAtlas): AtlasCompletionItem[] {
	const completionItems: AtlasCompletionItem[] = [];

	for (const story of atlas.stories) {
		completionItems.push({
			id: story.id,
			type: 'story',
			wordIds: getUniqueWordIds(getStoryDecks(story)),
		});

		for (const chapter of story.chapters) {
			completionItems.push({
				id: chapter.id,
				type: 'chapter',
				wordIds: getUniqueWordIds(chapter.decks),
			});

			for (const deck of chapter.decks) {
				completionItems.push({
					id: deck.id,
					type: 'deck',
					wordIds: getUniqueWordIds([deck]),
				});
			}
		}
	}

	return completionItems;
}

/**
 * Get every story, chapter, and deck that contains a word.
 */
export function getAtlasItemsContainingWord({
	atlas = storyAtlas,
	wordId,
}: GetAtlasItemsContainingWordProps): AtlasCompletionItem[] {
	const matchingItems: AtlasCompletionItem[] = [];

	for (const completionItem of getAtlasCompletionItems(atlas)) {
		if (completionItem.wordIds.includes(wordId)) {
			matchingItems.push(completionItem);
		}
	}

	return matchingItems;
}

/**
 * Get the path from a story (top level) to an item (story/chapter/deck).
 *
 * A story returns [story], a chapter returns [story, chapter], and a deck returns [story, chapter, deck].
 */
function findCompletionPath({ atlas = storyAtlas, id }: FindCompletionPathProps): Progression[] {
	for (const story of atlas.stories) {
		if (story.id === id) return [story];

		for (const chapter of story.chapters) {
			if (chapter.id === id) return [story, chapter];

			for (const deck of chapter.decks) {
				if (deck.id === id) return [story, chapter, deck];
			}
		}
	}

	return [];
}

/**
 * An item is only unlocked when it and all of its parents have met their unlock requirements.
 */
export function isItemUnlocked({
	atlas = storyAtlas,
	id,
	progressById,
}: IsItemUnlockedProps): boolean {
	const path = findCompletionPath({ atlas, id });

	if (path.length === 0) return false;

	for (const item of path) {
		for (const requirement of item.unlockRequirements ?? []) {
			const completionPercentage = progressById[requirement.id]?.completionPercentage ?? 0;

			if (completionPercentage < requirement.requiredCompletionPercentage) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Find a story by its progress id.
 */
export function findStoryById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): DeckStory | undefined {
	for (const story of atlas.stories) {
		if (story.id === id) return story;
	}
}

/**
 * Find a chapter and its parent story by the chapter's progress id.
 */
export function findAtlasLocationByChapterId(
	chapterId: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): AtlasChapterLocation | undefined {
	if (!chapterId) return;

	for (const story of atlas.stories) {
		const chapter = story.chapters.find(chapter => chapter.id === chapterId);

		if (chapter) {
			return {
				story,
				chapter,
			};
		}
	}
}

/**
 * Find a chapter by its progress id.
 */
export function findChapterById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): DeckChapter | undefined {
	return findAtlasLocationByChapterId(id, atlas)?.chapter;
}

/**
 * Get the display name for any item.
 */
function getItemName(id: string, atlas: StoryAtlas = storyAtlas): string {
	for (const story of atlas.stories) {
		if (story.id === id) return story.name;

		for (const chapter of story.chapters) {
			if (chapter.id === id) return chapter.name;

			for (const deck of chapter.decks) {
				if (deck.id === id) return deck.title;
			}
		}
	}

	return id;
}

/**
 * Build each UI explanation for unlocking an item.
 */
export function getUnlockCriteria(
	item: Progression,
	progressById: ProgressById,
	atlas: StoryAtlas = storyAtlas,
): UnlockCriteria[] {
	const requirements = item.unlockRequirements ?? [];

	return requirements.map(requirement => ({
		isUnlocked:
			(progressById[requirement.id]?.completionPercentage ?? 0) >=
			requirement.requiredCompletionPercentage,
		requiredPercentage: requirement.requiredCompletionPercentage,
		title: getItemName(requirement.id, atlas),
	}));
}

/**
 * Build a plain-text explanation for an unlock criterion.
 */
export function formatUnlockCriterion({
	requiredPercentage: requiredCompletionPercentage,
	title: requiredTitle,
}: UnlockCriteria): string {
	return `Reach ${requiredCompletionPercentage}% in ${requiredTitle} to unlock.`;
}
