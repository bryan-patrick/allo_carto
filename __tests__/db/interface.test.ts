import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getDeck } from '@/src/db/interface';

const mockGetAllAsync = jest.fn();

jest.mock('@/src/db/connection', () => ({
	deleteDB: jest.fn(),
	getDB: jest.fn(async () => ({ getAllAsync: mockGetAllAsync })),
	logThisIfItFails: jest.fn(),
	setDB: jest.fn(),
}));

jest.mock('@/src/db/queries/getDeckWordChoices', () =>
	jest.fn(async () => []),
);

jest.mock('@/src/util/shuffleArray', () =>
	jest.fn(<T,>(items: T[]) => [...items]),
);

describe('getDeck', () => {
	beforeEach(() => {
		mockGetAllAsync.mockReset();
	});

	test('randomizes rows before selecting the deck words', async () => {
		const deck: CardDeck = {
			title: 'Test deck',
			description: 'A deck used to test selection',
			image: undefined,
			CEFR: ['A1'],
			wordIds: ['word_one', 'word_two'],
			words: [],
			wordChoices: [],
		};

		mockGetAllAsync
			.mockResolvedValueOnce([
				{
					id: 'word_one',
					frenchWord: 'un',
					englishWords: '["one"]',
					pronunciation: 'un',
					isVulgar: 0,
					CEFR: 'A1',
					correctCount: 0,
				},
			])
			.mockResolvedValueOnce([]);

		await getDeck({ deck, amount: 1, userId: 'user_one' });

		const selectionQuery = mockGetAllAsync.mock.calls[0][0] as string;

		expect(selectionQuery).toMatch(
			/WHERE id IN \([^)]*\)\s+ORDER BY RANDOM\(\);/,
		);
		expect(selectionQuery).not.toMatch(/WHERE id IN \([^)]*\);/);
	});
});
