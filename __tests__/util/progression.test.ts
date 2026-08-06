import type { DeckAtlas } from '@/data/french/deckAtlas';
import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import {
	getAtlasProgressDetails,
	isProgressAccessible,
	validateProgression,
} from '@/src/util/atlasProgression';
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
				chapterName: 'Chapter 1',
				places: [
					{
						id: 'place_one',
						name: 'Place one',
						description: 'The first place',
						decks: [firstDeck, secondDeck],
					},
				],
			},
			{
				id: 'chapter_two',
				name: 'Chapter two',
				chapterName: 'Chapter 2',
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
						description: 'The second place',
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
	test('calculates full-precision familiarity without stacking New points', () => {
		expect(
			getCompletionPercentage({
				wordCount: 3,
				rankCounts: {
					fnew: 0,
					bronze: 1,
					silver: 1,
					gold: 0,
					diamond: 0,
				},
			}),
		).toBeCloseTo(25);
	});

	test('treats content with no words as 0%', () => {
		expect(
			getCompletionPercentage({
				wordCount: 0,
				rankCounts: {
					fnew: 0,
					bronze: 0,
					silver: 0,
					gold: 0,
					diamond: 0,
				},
			}),
		).toBe(0);
	});

	test('deduplicates words within decks, places, and chapters', () => {
		const details = getAtlasProgressDetails(makeAtlas());

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
			isProgressAccessible({
				atlas,
				id: 'deck_three',
				progressById: {},
			}),
		).toBe(false);
		expect(
			isProgressAccessible({
				atlas,
				id: 'deck_three',
				progressById: makeProgressById({ chapter_one: 50 }),
			}),
		).toBe(true);
	});

	test('rejects duplicate ids, missing references, and invalid percentages', () => {
		const duplicateAtlas = makeAtlas();
		duplicateAtlas.chapters[1].id = 'place_one';
		expect(() => validateProgression(duplicateAtlas)).toThrow();

		const missingReferenceAtlas = makeAtlas();
		missingReferenceAtlas.chapters[1].unlockRequirements = [
			{ id: 'missing', requiredCompletionPercentage: 50 },
		];
		expect(() => validateProgression(missingReferenceAtlas)).toThrow();

		const invalidPercentageAtlas = makeAtlas();
		invalidPercentageAtlas.chapters[1].unlockRequirements = [
			{ id: 'chapter_one', requiredCompletionPercentage: 101 },
		];
		expect(() => validateProgression(invalidPercentageAtlas)).toThrow();
	});
});
