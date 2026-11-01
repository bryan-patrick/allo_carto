import { storyAreas } from '@/data/french/storyAreas';
import type { StoryAtlas } from '@/data/french/storyAtlas';
import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import {
	findAtlasLocationByChapterId,
	getAtlasCompletionItems,
	isItemUnlocked,
} from '@/src/util/atlasCompletion';
import { getCompletionPercentage, type ProgressById } from '@/src/util/progression';
import { getCollectionLevel } from '@/src/util/collectionProgress';
import { emptyDeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';

function makeProgressById(percentages: Record<string, number>): ProgressById {
	const result: ProgressById = {};

	for (const id of Object.keys(percentages)) {
		result[id] = {
			userId: 'user_one',
			id,
			type: 'paragraph',
			completionPercentage: percentages[id],
		};
	}

	return result;
}

function makeAtlas(): StoryAtlas {
	const firstDeck = makeMockCardDeck({
		id: 'deck_one',
		passage: ['shared_word', 'first_word', 'shared_word'].map(wordId => ({ text: wordId, wordId })),
	});
	const secondDeck = makeMockCardDeck({
		id: 'deck_two',
		passage: ['shared_word', 'second_word', 'third_word'].map(wordId => ({ text: wordId, wordId })),
		unlockRequirements: [
			{
				id: 'deck_one',
				requiredWordProgress: 'new',
			},
		],
	});

	return {
		areas: storyAreas,
		stories: [
			{
				id: 'story_one',
				requiredLevel: 1,
				name: 'Story one',
				description: 'The first story',
				category: 'Travel',
				chapters: [
					{
						id: 'chapter_one',
						label: 'Chapter 1',
						name: 'Chapter one',
						decks: [firstDeck, secondDeck],
					},
				],
			},
			{
				id: 'story_two',
				requiredLevel: 1,
				name: 'Story two',
				description: 'The second story',
				category: 'Leo the Cat',
				unlockRequirements: [
					{
						id: 'story_one',
						requiredWordProgress: 'new',
					},
				],
				chapters: [
					{
						id: 'chapter_two',
						label: 'Chapter 1',
						name: 'Chapter two',
						decks: [
							makeMockCardDeck({
								id: 'deck_three',
								passage: [{ text: 'Fourth', wordId: 'fourth_word' }],
							}),
						],
					},
				],
			},
		],
	};
}

describe('progression', () => {
	test('finds a chapter with its parent story', () => {
		const atlas = makeAtlas();
		const location = findAtlasLocationByChapterId('chapter_two', atlas);

		expect(location).toEqual({
			story: atlas.stories[1],
			chapter: atlas.stories[1].chapters[0],
		});
		expect(findAtlasLocationByChapterId('missing_chapter', atlas)).toBeUndefined();
	});

	test('weights each progress stage without rounding stored completion', () => {
		expect(
			getCompletionPercentage({
				wordCount: 3,
				wordProgressCounts: {
					new: 1,
					learning: 1,
					familiar: 1,
					known: 0,
					mastered: 0,
				},
			}),
		).toBeCloseTo(29.1666666667);
	});

	test('treats content with no words as 0%', () => {
		expect(
			getCompletionPercentage({
				wordCount: 0,
				wordProgressCounts: {
					new: 0,
					learning: 0,
					familiar: 0,
					known: 0,
					mastered: 0,
				},
			}),
		).toBe(0);
	});

	test('deduplicates words within decks, chapters, and stories', () => {
		const details = getAtlasCompletionItems(makeAtlas());

		expect(details.find(item => item.id === 'deck_one')?.wordIds).toEqual([
			'shared_word',
			'first_word',
		]);
		expect(details.find(item => item.id === 'chapter_one')?.wordIds).toEqual([
			'shared_word',
			'first_word',
			'second_word',
			'third_word',
		]);
		expect(details.find(item => item.id === 'story_one')?.wordIds).toEqual([
			'shared_word',
			'first_word',
			'second_word',
			'third_word',
		]);
	});

	test('opens each published story without requiring progress in another story', () => {
		const atlas = makeAtlas();
		const progressById = makeProgressById({ story_one: 100, story_two: 0 });
		progressById.story_one.wordCount = 4;
		progressById.story_one.wordProgressCounts = { ...emptyDeckWordProgressCounts, mastered: 4 };

		expect(
			isItemUnlocked({
				atlas,
				id: 'deck_three',
				progressById: {},
			}),
		).toBe(true);
		expect(
			isItemUnlocked({
				atlas,
				progressById,
				id: 'story_two',
			}),
		).toBe(true);
		expect(
			isItemUnlocked({
				atlas,
				progressById,
				id: 'deck_three',
			}),
		).toBe(true);
	});

	test('opens the next paragraph after the previous paragraph earns its first gem', () => {
		const atlas = makeAtlas();
		const progressById = makeProgressById({ deck_one: 12.5, deck_two: 0 });
		const props = {
			atlas,
			progressById,
			id: 'deck_two',
		};

		progressById.deck_one.wordCount = 2;
		progressById.deck_one.wordProgressCounts = { ...emptyDeckWordProgressCounts, new: 2 };
		expect(isItemUnlocked(props)).toBe(false);

		progressById.deck_one.hasFirstGem = true;
		expect(isItemUnlocked(props)).toBe(true);
	});

	test('awards a collection level from its weakest word, including words shared across decks', () => {
		const progress = makeProgressById({ chapter_one: 90 }).chapter_one;
		progress.wordCount = 3;
		progress.wordProgressCounts = { ...emptyDeckWordProgressCounts, unseen: 1, mastered: 2 };
		expect(getCollectionLevel(progress)).toBe('unseen');
		progress.wordProgressCounts = { ...emptyDeckWordProgressCounts, learning: 1, mastered: 2 };
		expect(getCollectionLevel(progress)).toBe('learning');
		progress.wordProgressCounts = {
			...emptyDeckWordProgressCounts,
			familiar: 1,
			known: 1,
			mastered: 1,
		};
		expect(getCollectionLevel(progress)).toBe('familiar');
		progress.wordProgressCounts = { ...emptyDeckWordProgressCounts, known: 1, mastered: 2 };
		expect(getCollectionLevel(progress)).toBe('known');
		progress.wordProgressCounts = { ...emptyDeckWordProgressCounts, mastered: 3 };
		expect(getCollectionLevel(progress)).toBe('mastered');
	});
});
