import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getDeck, getTables } from '@/src/db/interface';

const mockGetAllAsync = jest.fn();
const mockExecAsync = jest.fn();
const mockRunAsync = jest.fn();

jest.mock('@/src/db/connection', () => ({
	deleteDB: jest.fn(),
	getDB: jest.fn(async () => ({
		execAsync: mockExecAsync,
		getAllAsync: mockGetAllAsync,
		runAsync: mockRunAsync,
	})),
	logThisIfItFails: jest.fn(
		async (_message: string, operation: () => Promise<unknown>) => operation(),
	),
	setDB: jest.fn(),
}));

jest.mock('@/src/db/queries/getDeckWordChoices', () => jest.fn(async () => []));

jest.mock('@/src/util/wordRaffle', () =>
	jest.fn(<T>(words: T[]) => [...words]),
);

describe('getDeck', () => {
	beforeEach(() => {
		mockGetAllAsync.mockReset();
		mockExecAsync.mockReset();
		mockRunAsync.mockReset();
	});

	test('refreshes existing word metadata when seeding', async () => {
		await getTables();

		const [wordSeedQuery] = mockRunAsync.mock.calls[0];

		expect(wordSeedQuery).toMatch(/ON CONFLICT\(id\) DO UPDATE SET/);
		expect(wordSeedQuery).toMatch(/englishWords = excluded\.englishWords/);
		expect(wordSeedQuery).toMatch(/pronunciation = excluded\.pronunciation/);
		expect(wordSeedQuery).not.toMatch(/correctCount = excluded\.correctCount/);
	});

	test('loads every word before the word raffle', async () => {
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

		const [selectionQuery] = mockGetAllAsync.mock.calls[0];

		expect(selectionQuery).toMatch(/WHERE w\.id IN \([^)]*\)/);
		expect(selectionQuery).not.toMatch(/ORDER BY RANDOM\(\)/);
	});

	test('can filter deck words by selected rank', async () => {
		const deck: CardDeck = {
			title: 'Test deck',
			description: 'A deck used to test selection',
			image: undefined,
			CEFR: ['A1'],
			wordIds: ['word_one', 'word_two'],
			words: [],
			wordChoices: [],
		};

		mockGetAllAsync.mockResolvedValueOnce([]);

		await getDeck({ deck, amount: 1, rank: 'bronze', userId: 'user_one' });

		const [selectionQuery, userId, ...wordIds] = mockGetAllAsync.mock.calls[0];

		expect(selectionQuery).toMatch(/LEFT JOIN userWords AS uw/);
		expect(selectionQuery).toMatch(/COALESCE\(uw\.correctCount, 0\) >= 3/);
		expect(selectionQuery).toMatch(/COALESCE\(uw\.correctCount, 0\) < 7/);
		expect(userId).toBe('user_one');
		expect(wordIds).toEqual(deck.wordIds);
	});
});
