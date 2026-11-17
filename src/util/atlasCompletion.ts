import type { Chapter, Story, StoryAtlas } from '@/data/french/storyAtlas';
import { storyAtlas } from '@/data/french/storyAtlas';
import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import { hasChapterContent, hasParagraphContent, hasStoryContent } from './atlasContent';
import type { ProgressById, Progression, ProgressType } from './progression';
import { getCompletedSolveStages, type SolveStage } from './solveProgression';

/**
 * Typing
 */
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
	progressById?: ProgressById;
}

export interface UnlockCriteria {
	isUnlocked: boolean;
	type: 'chapter' | 'paragraph';
	title: string;
	completedParagraphCount: number;
	paragraphCount: number;
}

export interface AtlasChapterLocation {
	story: Story;
	chapter: Chapter;
}

export interface NextParagraphLocation {
	story: Story;
	chapter: Chapter;
	paragraph: Paragraph;
}

/**
 * The amount of puzzles required to unlock the next paragraph
 */
const gemsRequiredToUnlockNextParagraph = 3;

function getUniqueWordIds(paragraphs: Paragraph[]): string[] {
	const uniqueWordIds = new Set<string>();

	for (const paragraph of paragraphs) {
		for (const wordId of paragraph.wordIds) {
			uniqueWordIds.add(wordId);
		}
	}

	return Array.from(uniqueWordIds);
}

/**
 * Build the atlas for the completion items
 */
export function getAtlasCompletionItems(atlas: StoryAtlas = storyAtlas): AtlasCompletionItem[] {
	const completionItems: AtlasCompletionItem[] = [];

	for (const story of atlas.stories) {
		const chapters = story.chapters.filter(hasChapterContent);

		const storyParagraphs = chapters.flatMap(chapter =>
			chapter.paragraphs.filter(hasParagraphContent),
		);

		const storyParagraphIds = storyParagraphs.map(paragraph => paragraph.id);

		completionItems.push({
			id: story.id,
			type: 'story',
			wordIds: getUniqueWordIds(storyParagraphs),
			paragraphIds: storyParagraphIds,
		});

		for (const chapter of chapters) {
			const paragraphs = chapter.paragraphs.filter(hasParagraphContent);
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

/**
 * This exists because we keep track of percentage
 * completion for each story/chapter/paragraph.
 *
 * This is used to determine what progress to update when
 * a word changes learning level.
 */
export function getAtlasItemsContainingWord({
	atlas = storyAtlas,
	wordId,
}: GetAtlasItemsContainingWordProps): AtlasCompletionItem[] {
	const completionItems = getAtlasCompletionItems(atlas);

	return completionItems.filter(item => item.wordIds.includes(wordId));
}

/**
 * Get the cononical path of the story -> chapter -> paragraph
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

			for (const paragraph of chapter.paragraphs) {
				if (paragraph.id === id) {
					return [story, chapter, paragraph];
				}
			}
		}
	}

	return [];
}

/**
 * Check if the content is locked
 */
export function isItemUnlocked({
	atlas = storyAtlas,
	id,
	progressById,
}: FindCompletionPathProps): boolean {
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

	return getUnlockCriteria(item, progressById ?? {}, atlas).every(
		criterion => criterion.isUnlocked,
	);
}

/**
 * List the chapter's paragraphs
 */
export function getVisibleParagraphs(chapter: Chapter, progressById: ProgressById): Paragraph[] {
	const paragraphs = chapter.paragraphs.filter(hasParagraphContent);
	const visibleParagraphs: Paragraph[] = [];

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
 * Determines unlock criteria and explain why content is locked.
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
		const paragraphs = chapter.paragraphs.filter(hasParagraphContent);
		const paragraphsWithThreeGems = paragraphs.filter(paragraph => {
			const completedStages = getCompletedSolveStages(progressById[paragraph.id]);

			return completedStages >= gemsRequiredToUnlockNextParagraph;
		});

		if (chapter.id !== path[1]?.id) {
			criteria.push({
				isUnlocked: paragraphsWithThreeGems.length === paragraphs.length,
				type: 'chapter',
				title: chapter.name,
				completedParagraphCount: paragraphsWithThreeGems.length,
				paragraphCount: paragraphs.length,
			});
			continue;
		}

		if (path.length === 3) {
			for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
				const completedStages = getCompletedSolveStages(progressById[paragraph.id]);
				const hasThreeGems = completedStages >= gemsRequiredToUnlockNextParagraph;
				const paragraphNumber = paragraphIndex + 1;
				let paragraphLabel = `paragraph ${paragraphNumber}`;
				let completedParagraphCount = 0;

				if (hasThreeGems) {
					completedParagraphCount = 1;
				}

				if (paragraphIndex === 0) {
					paragraphLabel = 'the first paragraph';
				}

				if (paragraph.id === item.id) {
					break;
				}

				criteria.push({
					isUnlocked: hasThreeGems,
					type: 'paragraph',
					title: paragraphLabel,
					completedParagraphCount,
					paragraphCount: 1,
				});
			}
		}

		break;
	}

	return criteria;
}

/**
 * Formats unlock criteria for the user as clearly as we can
 */
export function formatUnlockCriterion(criterion: UnlockCriteria): string {
	if (criterion.type === 'chapter') {
		return `Earn 3 gems from each paragraph in “${criterion.title}” to continue (${criterion.completedParagraphCount} of ${criterion.paragraphCount} paragraphs have 3 gems).`;
	}

	return `Compplete 3 puzzles from ${criterion.title} to continue.`;
}

export function findStoryById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): Story | undefined {
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

/**
 * Finds the chapter by id based on the atlas
 */
export function findChapterById(
	id: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): Chapter | undefined {
	return findAtlasLocationByChapterId(id, atlas)?.chapter;
}

/**
 * Find a paragraph's chapter and get its required player level for a puzzle.
 */
export function getChapterSolveUnlockLevel(deckId: string, stage: SolveStage): number | undefined {
	const path = findCompletionPath({
		id: deckId,
	});

	const chapter = findChapterById(path[1]?.id);

	return chapter?.solveUnlockLevels?.[stage];
}

export function findParagraphById(
	id: string,
	atlas: StoryAtlas = storyAtlas,
): Paragraph | undefined {
	for (const story of atlas.stories) {
		for (const chapter of story.chapters) {
			const paragraph = chapter.paragraphs.find(paragraph => paragraph.id === id);

			if (paragraph) {
				return paragraph;
			}
		}
	}
}

/**
 * Since we aren't using paragraph names we just use
 * the number of the paragraph to show the user. (e.g. Paragraph 2)
 */
export function getParagraphNumber(
	deckId: string,
	atlas: StoryAtlas = storyAtlas,
): number | undefined {
	const path = findCompletionPath({
		atlas,
		id: deckId,
	});
	const chapter = findChapterById(path[1]?.id, atlas);
	const paragraphs = chapter?.paragraphs.filter(hasParagraphContent) ?? [];
	const paragraphIndex = paragraphs.findIndex(paragraph => paragraph.id === deckId);

	if (paragraphIndex === -1) {
		return undefined;
	}

	return paragraphIndex + 1;
}

/**
 * Show the name of the story or chapter, or the paragraph number.
 */
export function getAtlasItemLabel(id: string, atlas: StoryAtlas = storyAtlas): string {
	const story = findStoryById(id, atlas);
	const chapter = findChapterById(id, atlas);
	const paragraphNumber = getParagraphNumber(id, atlas);

	let label = 'Paragraph';

	if (story) {
		label = story.name;
	} else if (chapter) {
		label = chapter.name;
	} else if (paragraphNumber !== undefined) {
		label = `Paragraph ${paragraphNumber}`;
	}

	return label;
}

/**
 * Gets the next paragraph. This is needed since the
 * next paragraph may be in a different chapter/story and
 * isn't necessarily iterative.
 */
export function findNextParagraph(
	deckId: string,
	atlas: StoryAtlas = storyAtlas,
): NextParagraphLocation | undefined {
	let foundCurrentParagraph = false;

	for (const story of atlas.stories) {
		for (const chapter of story.chapters.filter(hasChapterContent)) {
			for (const paragraph of chapter.paragraphs.filter(hasParagraphContent)) {
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
