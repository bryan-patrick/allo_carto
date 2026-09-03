import type { StoryAtlas } from '@/data/french/storyAtlas';
import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import {
	findAtlasLocationByChapterId,
	getAtlasCompletionItems,
	isItemUnlocked,
} from '@/src/util/atlasCompletion';
import { getCompletionPercentage, type ProgressById } from '@/src/util/progression';

function makeProgressById(percentages: Record<string, number>): ProgressById {
	const result: ProgressById = {};

	for (const id of Object.keys(percentages)) {
		result[id] = {
			userId: 'user_one',
			id,
			type: 'deck',
			completionPercentage: percentages[id],
		};
	}

	return result;
}

function makeAtlas(): StoryAtlas {
	const firstDeck = makeMockCardDeck({
		id: 'deck_one',
		wordIds: ['shared_word', 'first_word', 'shared_word'],
	});
	const secondDeck = makeMockCardDeck({
		id: 'deck_two',
		wordIds: ['shared_word', 'second_word', 'third_word'],
		unlockRequirements: [
			{
				id: 'deck_one',
				requiredCompletionPercentage: 50,
			},
		],
	});

	return {
		stories: [
			{
				id: 'story_one',
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
				name: 'Story two',
				description: 'The second story',
				category: 'Mystery',
				unlockRequirements: [
					{
						id: 'story_one',
						requiredCompletionPercentage: 50,
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
								wordIds: ['fourth_word'],
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

	test('calculates full-precision familiarity without stacking New points', () => {
		expect(
			getCompletionPercentage({
				wordCount: 3,
				wordProgressCounts: {
					new: 0,
					learning: 1,
					familiar: 1,
					known: 0,
					mastered: 0,
				},
			}),
		).toBeCloseTo(25);
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

	test('checks every parent before allowing direct access to a child', () => {
		const atlas = makeAtlas();

		expect(
			isItemUnlocked({
				atlas,
				id: 'deck_three',
				progressById: {},
			}),
		).toBe(false);
		expect(
			isItemUnlocked({
				atlas,
				id: 'deck_three',
				progressById: makeProgressById({ story_one: 50 }),
			}),
		).toBe(true);
	});
});
