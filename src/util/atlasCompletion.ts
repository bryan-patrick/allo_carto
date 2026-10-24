import type { DeckChapter, DeckStory, StoryAtlas } from '@/data/french/storyAtlas';
import { storyAtlas } from '@/data/french/storyAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getWordsAtLevel, hasCollectionLevel } from './collectionProgress';
import type { ProgressById, Progression, ProgressType } from './progression';
import { getWordProgressDefinitionByKey, type WordProgressKey } from './wordProgress';

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
	userLevel: number;
}

export type UnlockCriteria =
	| {
			isUnlocked: boolean;
			requiredWordProgress: WordProgressKey;
			title: string;
			qualifiedWordCount: number;
			wordCount: number;
	  }
	| { isUnlocked: boolean; requiredUnlock: string }
	| { isUnlocked: boolean; requiredLevel: number };

export interface AtlasChapterLocation {
	story: DeckStory;
	chapter: DeckChapter;
}

export interface AtlasItem {
	id: string;
	type: ProgressType;
	title: string;
	context?: string;
	requiresChoice: boolean;
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
export function findCompletionPath({
	atlas = storyAtlas,
	id,
}: FindCompletionPathProps): Progression[] {
	for (const story of atlas.stories) {
		if (story.id === id) {
			return [story];
		}

		for (const chapter of story.chapters) {
			if (chapter.id === id) {
				return [story, chapter];
			}

			for (const deck of chapter.decks) {
				if (deck.id === id) {
					return [story, chapter, deck];
				}
			}
		}
	}

	return [];
}

function requiresUnlockChoice(item: Progression): boolean {
	return (item.requiredLevel ?? 1) > 1 || (item.unlockRequirements?.length ?? 0) > 0;
}

/**
 * Check if the item is available
 */
export function isItemUnlocked({
	atlas = storyAtlas,
	id,
	progressById,
}: IsItemUnlockedProps): boolean {
	const path = findCompletionPath({ atlas, id });

	if (path.length === 0) {
		return false;
	}

	return path.every(
		item => !requiresUnlockChoice(item) || Boolean(progressById[item.id]?.isUnlocked),
	);
}

/** Meeting the requirements offers a choice; it never grants access by itself. */
export function isItemReadyToUnlock(props: IsItemUnlockedProps): boolean {
	const path = findCompletionPath(props);
	const item = path[path.length - 1];
	const parent = path[path.length - 2];

	if (!item || !requiresUnlockChoice(item) || props.progressById[item.id]?.isUnlocked) {
		return false;
	}

	if (parent && !isItemUnlocked({ ...props, id: parent.id })) {
		return false;
	}

	return getItemUnlockCriteria(item, props.progressById, props.userLevel, props.atlas).every(
		criterion => criterion.isUnlocked,
	);
}

function getAtlasItems(atlas: StoryAtlas): AtlasItem[] {
	const items: AtlasItem[] = [];

	for (const story of atlas.stories) {
		items.push({
			id: story.id,
			type: 'story',
			title: story.name,
			requiresChoice: requiresUnlockChoice(story),
		});

		for (const chapter of story.chapters) {
			items.push({
				id: chapter.id,
				type: 'chapter',
				title: chapter.name,
				context: `${story.name} · ${chapter.label}`,
				requiresChoice: requiresUnlockChoice(chapter),
			});

			for (const deck of chapter.decks) {
				items.push({
					id: deck.id,
					type: 'deck',
					title: deck.title,
					context: `${story.name} · ${chapter.name}`,
					requiresChoice: requiresUnlockChoice(deck),
				});
			}
		}
	}

	return items;
}

export function getUnlockedAtlasItems(props: Omit<IsItemUnlockedProps, 'id'>): AtlasItem[] {
	return getAtlasItems(props.atlas ?? storyAtlas).filter(item =>
		isItemUnlocked({ ...props, id: item.id }),
	);
}

export function getReadyToUnlockAtlasItems(props: Omit<IsItemUnlockedProps, 'id'>): AtlasItem[] {
	return getAtlasItems(props.atlas ?? storyAtlas).filter(item =>
		isItemReadyToUnlock({ ...props, id: item.id }),
	);
}

/**
 * Keep accepted offers visible on the results page while also revealing eligible children.
 */
export function getAtlasUnlockOffers(props: Omit<IsItemUnlockedProps, 'id'>): AtlasItem[] {
	return getAtlasItems(props.atlas ?? storyAtlas).filter(item => {
		return (
			item.requiresChoice &&
			(isItemUnlocked({ ...props, id: item.id }) || isItemReadyToUnlock({ ...props, id: item.id }))
		);
	});
}

/**
 * Find a story by its progress id.
 */
export function findStoryById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): DeckStory | undefined {
	for (const story of atlas.stories) {
		if (story.id === id) {
			return story;
		}
	}
}

/**
 * Find a chapter and its parent story by the chapter's progress id.
 */
export function findAtlasLocationByChapterId(
	chapterId: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): AtlasChapterLocation | undefined {
	if (!chapterId) {
		return;
	}

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
		if (story.id === id) {
			return story.name;
		}

		for (const chapter of story.chapters) {
			if (chapter.id === id) {
				return chapter.name;
			}

			for (const deck of chapter.decks) {
				if (deck.id === id) {
					return deck.title;
				}
			}
		}
	}

	return id;
}

/**
 * Explain the item's own requirements using the same word counts as its gems.
 */
function getItemUnlockCriteria(
	item: Progression,
	progressById: ProgressById,
	userLevel: number,
	atlas: StoryAtlas = storyAtlas,
): UnlockCriteria[] {
	const criteria: UnlockCriteria[] = [];

	if (item.requiredLevel !== undefined && item.requiredLevel > 1) {
		criteria.push({
			isUnlocked: userLevel >= item.requiredLevel,
			requiredLevel: item.requiredLevel,
		});
	}

	for (const requirement of item.unlockRequirements ?? []) {
		const progress = progressById[requirement.id];

		criteria.push({
			isUnlocked: hasCollectionLevel(progress, requirement.requiredWordProgress),
			requiredWordProgress: requirement.requiredWordProgress,
			title: getItemName(requirement.id, atlas),
			qualifiedWordCount: getWordsAtLevel(progress, requirement.requiredWordProgress),
			wordCount: progress?.wordCount ?? 0,
		});
	}

	return criteria;
}

/**
 * Gets what's needed to unlock a chapter, story, or deck
 */
export function getUnlockCriteria(
	item: Progression,
	progressById: ProgressById,
	userLevel: number,
	atlas: StoryAtlas = storyAtlas,
): UnlockCriteria[] {
	const path = findCompletionPath({ atlas, id: item.id });
	const criteria: UnlockCriteria[] = [];

	for (const ancestor of path) {
		if (progressById[ancestor.id]?.isUnlocked) {
			continue;
		}

		const requirements = getItemUnlockCriteria(ancestor, progressById, userLevel, atlas);

		criteria.push(...requirements);

		if (ancestor.id !== item.id && requiresUnlockChoice(ancestor)) {
			criteria.push({ isUnlocked: false, requiredUnlock: getItemName(ancestor.id, atlas) });
		}
	}

	return criteria;
}

export function formatUnlockCriterion(criterion: UnlockCriteria): string {
	switch (true) {
		case 'requiredLevel' in criterion:
			return `Reach Lvl. ${criterion.requiredLevel} to unlock.`;

		case 'requiredUnlock' in criterion:
			return `Unlock “${criterion.requiredUnlock}” first.`;

		case criterion.isUnlocked: {
			const level = getWordProgressDefinitionByKey(criterion.requiredWordProgress);

			return `Every word in “${criterion.title}” is at least ${level.name}.`;
		}

		case 'requiredWordProgress' in criterion && criterion.requiredWordProgress === 'new': {
			return `See every word in “${criterion.title}” to unlock. (${criterion.qualifiedWordCount}/${criterion.wordCount} seen).`;
		}

		default: {
			const level = getWordProgressDefinitionByKey(criterion.requiredWordProgress);

			return `Bring every word in “${criterion.title}” to ${level.name} to unlock.\n${criterion.qualifiedWordCount}/${criterion.wordCount} words ready.`;
		}
	}
}
