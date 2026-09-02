import type { DeckAtlas } from '@/data/french/deckAtlas';
import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import {
	findAtlasLocationByPlaceId,
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

function makeAtlas(): DeckAtlas {
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
		chapters: [
			{
				id: 'chapter_one',
				name: 'Chapter one',
				description: 'The first chapter',
				label: 'Chapter 1',
				places: [
					{
						id: 'place_one',
						name: 'Place one',
						decks: [firstDeck, secondDeck],
					},
				],
			},
			{
				id: 'chapter_two',
				name: 'Chapter two',
				description: 'The second chapter',
				label: 'Chapter 2',
				unlockRequirements: [
					{
						id: 'chapter_one',
						requiredCompletionPercentage: 50,
					},
				],
				places: [
					{
						id: 'place_two',
						name: 'Place two',
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
	test('finds a place with its parent chapter and chapter position', () => {
		const atlas = makeAtlas();
		const location = findAtlasLocationByPlaceId('place_two', atlas);

		expect(location).toEqual({
			chapter: atlas.chapters[1],
			place: atlas.chapters[1].places[0],
			chapterIndex: 1,
			chapterNumber: 2,
		});
		expect(findAtlasLocationByPlaceId('missing_place', atlas)).toBeUndefined();
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

	test('deduplicates words within decks, places, and chapters', () => {
		const details = getAtlasCompletionItems(makeAtlas());

		expect(details.find(item => item.id === 'deck_one')?.wordIds).toEqual([
			'shared_word',
			'first_word',
		]);
		expect(details.find(item => item.id === 'place_one')?.wordIds).toEqual([
			'shared_word',
			'first_word',
			'second_word',
			'third_word',
		]);
		expect(details.find(item => item.id === 'chapter_one')?.wordIds).toEqual([
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
				progressById: makeProgressById({ chapter_one: 50 }),
			}),
		).toBe(true);
	});
});
