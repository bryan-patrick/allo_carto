import type { DeckChapter } from '@/data/french/deckAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import getDeckRankCounts from '@/src/db/queries/getDeckRankCounts';
import getChapterProgressPercent from '@/src/util/getDecksProgress';

jest.mock('@/src/db/queries/getDeckRankCounts', () => jest.fn());

const mockGetDeckRankCounts = jest.mocked(getDeckRankCounts);

/**
 * Make a small deck for chapter progress tests.
 */
function makeDeck(id: string, wordIds: string[]): CardDeck {
	const result: CardDeck = {
		id,
		title: id,
		CEFR: ['A1'],
		description: '',
		wordIds,
		words: [],
		image: undefined,
		wordChoices: [],
		colors: {
			dark: {
				primary: '#000000',
				secondary: '#000000',
			},
			light: {
				primary: '#ffffff',
				secondary: '#ffffff',
			},
		},
	};

	return result;
}

/**
 * Make a chapter containing the supplied decks.
 */
function makeChapter(decks: CardDeck[]): DeckChapter {
	const result: DeckChapter = {
		id: 'chapter_one',
		name: 'Chapter one',
		chapterName: 'Chapter 1:',
		places: [
			{
				id: 'place_one',
				name: 'Place one',
				description: '',
				decks,
			},
		],
	};

	return result;
}

describe('chapter progress', () => {
	beforeEach(() => {
		mockGetDeckRankCounts.mockReset();
	});

	it('returns zero for a chapter with no words', async () => {
		const chapter = makeChapter([]);
		const result = await getChapterProgressPercent({
			chapter,
			userId: 'user_one',
		});

		expect(result).toBe(0);
		expect(mockGetDeckRankCounts).not.toHaveBeenCalled();
	});

	it('only counts a repeated word once', async () => {
		const chapter = makeChapter([
			makeDeck('deck_one', ['word_one', 'word_two']),
			makeDeck('deck_two', ['word_two', 'word_three']),
		]);

		mockGetDeckRankCounts.mockResolvedValue({
			seen: 3,
			fnew: 0,
			bronze: 0,
			silver: 0,
			gold: 0,
			diamond: 3,
		});

		const result = await getChapterProgressPercent({
			chapter,
			userId: 'user_one',
		});

		expect(result).toBe(100);
		expect(mockGetDeckRankCounts).toHaveBeenCalledWith({
			userId: 'user_one',
			wordIds: ['word_one', 'word_two', 'word_three'],
		});
	});
});
