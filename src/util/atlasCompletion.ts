import type { DeckChapter, DeckStory, StoryAtlas } from '@/data/french/storyAtlas';
import { storyAtlas } from '@/data/french/storyAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { hasChapterContent, hasParagraphContent, hasStoryContent } from './atlasContent';
import type { ProgressById, Progression, ProgressType } from './progression';

interface AtlasCompletionItem {
	id: string;
	type: ProgressType;
	wordIds: string[];
	paragraphIds: string[];
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
	type: 'chapter' | 'paragraph';
	title: string;
	completedParagraphCount: number;
	paragraphCount: number;
}

export interface AtlasChapterLocation {
	story: DeckStory;
	chapter: DeckChapter;
}

export interface NextParagraphLocation extends AtlasChapterLocation {
	paragraph: CardDeck;
}

function getUniqueWordIds(paragraphs: CardDeck[]): string[] {
	const uniqueWordIds = new Set<string>();

	for (const paragraph of paragraphs) {
		for (const wordId of paragraph.wordIds) {
			uniqueWordIds.add(wordId);
		}
	}

	return Array.from(uniqueWordIds);
}

/**
 * We keep vocabulary totals and solved-paragraph totals separate for each atlas item.
 * Empty chapters and paragraphs do not count toward finishing a story.
 */
export function getAtlasCompletionItems(atlas: StoryAtlas = storyAtlas): AtlasCompletionItem[] {
	const completionItems: AtlasCompletionItem[] = [];

	for (const story of atlas.stories) {
		const chapters = story.chapters.filter(hasChapterContent);
		const storyParagraphs = chapters.flatMap(chapter => chapter.decks.filter(hasParagraphContent));
		const storyParagraphIds = storyParagraphs.map(paragraph => paragraph.id);

		completionItems.push({
			id: story.id,
			type: 'story',
			wordIds: getUniqueWordIds(storyParagraphs),
			paragraphIds: storyParagraphIds,
		});

		for (const chapter of chapters) {
			const paragraphs = chapter.decks.filter(hasParagraphContent);
			const paragraphIds = paragraphs.map(paragraph => paragraph.id);

			completionItems.push({
				id: chapter.id,
				type: 'chapter',
				wordIds: getUniqueWordIds(paragraphs),
				paragraphIds,
			});

			for (const paragraph of paragraphs) {
				completionItems.push({
					id: paragraph.id,
					type: 'paragraph',
					wordIds: getUniqueWordIds([paragraph]),
					paragraphIds: [paragraph.id],
				});
			}
		}
	}

	return completionItems;
}

export function getAtlasItemsContainingWord({
	atlas = storyAtlas,
	wordId,
}: GetAtlasItemsContainingWordProps): AtlasCompletionItem[] {
	const completionItems = getAtlasCompletionItems(atlas);

	return completionItems.filter(item => item.wordIds.includes(wordId));
}

/**
 * A paragraph's path contains its story, chapter, and paragraph, in that order.
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

			for (const paragraph of chapter.decks) {
				if (paragraph.id === id) {
					return [story, chapter, paragraph];
				}
			}
		}
	}

	return [];
}

/**
 * Every published story starts open. Within a story, earlier paragraphs and chapters
 * need their first gems before the player moves forward. XP never blocks this path.
 */
export function isItemUnlocked({
	atlas = storyAtlas,
	id,
	progressById,
}: IsItemUnlockedProps): boolean {
	const path = findCompletionPath({
		atlas,
		id,
	});
	const story = findStoryById(path[0]?.id, atlas);
	const chapter = findChapterById(path[1]?.id, atlas);
	const paragraph = path.length === 3 ? findParagraphById(id, atlas) : undefined;
	const item = path[path.length - 1];

	if (!story || !hasStoryContent(story) || !item) {
		return false;
	}

	if (path.length > 1 && (!chapter || !hasChapterContent(chapter))) {
		return false;
	}

	if (path.length === 3 && (!paragraph || !hasParagraphContent(paragraph))) {
		return false;
	}

	return getUnlockCriteria(item, progressById, atlas).every(criterion => criterion.isUnlocked);
}

/**
 * List the chapter's paragraphs
 */
export function getVisibleParagraphs(chapter: DeckChapter, progressById: ProgressById): CardDeck[] {
	const paragraphs = chapter.decks.filter(hasParagraphContent);
	const visibleParagraphs: CardDeck[] = [];

	for (const paragraph of paragraphs) {
		const isUnlocked = isItemUnlocked({
			id: paragraph.id,
			progressById,
		});

		visibleParagraphs.push(paragraph);

		if (!isUnlocked) {
			break;
		}
	}

	return visibleParagraphs;
}

/**
 * We use these same requirements for access checks and the messages on locked content.
 * A chapter is finished only when every playable paragraph has its saved first gem.
 */
export function getUnlockCriteria(
	item: Progression,
	progressById: ProgressById,
	atlas: StoryAtlas = storyAtlas,
): UnlockCriteria[] {
	const path = findCompletionPath({
		atlas,
		id: item.id,
	});
	const story = findStoryById(path[0]?.id, atlas);
	const criteria: UnlockCriteria[] = [];

	if (!story || path.length < 2) {
		return criteria;
	}

	for (const chapter of story.chapters.filter(hasChapterContent)) {
		const paragraphs = chapter.decks.filter(hasParagraphContent);
		const solvedParagraphs = paragraphs.filter(
			paragraph => progressById[paragraph.id]?.hasFirstGem,
		);

		if (chapter.id !== path[1]?.id) {
			criteria.push({
				isUnlocked: solvedParagraphs.length === paragraphs.length,
				type: 'chapter',
				title: chapter.name,
				completedParagraphCount: solvedParagraphs.length,
				paragraphCount: paragraphs.length,
			});
			continue;
		}

		if (path.length === 3) {
			for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
				const hasFirstGem = Boolean(progressById[paragraph.id]?.hasFirstGem);
				const paragraphNumber = paragraphIndex + 1;
				let paragraphLabel = `paragraph ${paragraphNumber}`;

				if (paragraphIndex === 0) {
					paragraphLabel = 'the first paragraph';
				}

				if (paragraph.id === item.id) {
					break;
				}

				criteria.push({
					isUnlocked: hasFirstGem,
					type: 'paragraph',
					title: paragraphLabel,
					completedParagraphCount: hasFirstGem ? 1 : 0,
					paragraphCount: 1,
				});
			}
		}

		break;
	}

	return criteria;
}

export function formatUnlockCriterion(criterion: UnlockCriteria): string {
	if (criterion.type === 'chapter') {
		return `Solve every paragraph in “${criterion.title}” to continue (${criterion.completedParagraphCount} of ${criterion.paragraphCount} solved).`;
	}

	return `Solve ${criterion.title} to continue.`;
}

export function findStoryById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): DeckStory | undefined {
	return atlas.stories.find(story => story.id === id);
}

export function findAtlasLocationByChapterId(
	chapterId: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): AtlasChapterLocation | undefined {
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

export function findChapterById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): DeckChapter | undefined {
	return findAtlasLocationByChapterId(id, atlas)?.chapter;
}

export function findParagraphById(
	id: string,
	atlas: StoryAtlas = storyAtlas,
): CardDeck | undefined {
	for (const story of atlas.stories) {
		for (const chapter of story.chapters) {
			const paragraph = chapter.decks.find(paragraph => paragraph.id === id);

			if (paragraph) {
				return paragraph;
			}
		}
	}
}

/**
 * The next reading action stays within this story and skips unwritten content.
 */
export function findNextParagraph(
	deckId: string,
	atlas: StoryAtlas = storyAtlas,
): NextParagraphLocation | undefined {
	let foundCurrentParagraph = false;

	for (const story of atlas.stories) {
		for (const chapter of story.chapters.filter(hasChapterContent)) {
			for (const paragraph of chapter.decks.filter(hasParagraphContent)) {
				if (foundCurrentParagraph) {
					return {
						story,
						chapter,
						paragraph,
					};
				}

				if (paragraph.id === deckId) {
					foundCurrentParagraph = true;
				}
			}
		}

		if (foundCurrentParagraph) {
			return;
		}
	}
}
