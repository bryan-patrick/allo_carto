import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getDeck, getTables, getWordProgressById } from '@/src/db/interface';

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
			id: 'deck__test',
			title: 'Test deck',
			description: 'A deck used to test selection',
			image: undefined,
			CEFR: ['A1'],
			wordIds: ['word_one', 'word_two'],
			words: [],
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
			id: 'deck__test',
			title: 'Test deck',
			description: 'A deck used to test selection',
			image: undefined,
			CEFR: ['A1'],
			wordIds: ['word_one', 'word_two'],
			words: [],
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

		mockGetAllAsync.mockResolvedValueOnce([]);

		await getDeck({ deck, amount: 1, rank: 'bronze', userId: 'user_one' });
		await getDeck({ deck, amount: 1, rank: 'unseen', userId: 'user_one' });
		await getDeck({ deck, amount: 1, rank: 'fnew', userId: 'user_one' });

		const [selectionQuery, userId, ...wordIds] = mockGetAllAsync.mock.calls[0];
		const [unseenSelectionQuery] = mockGetAllAsync.mock.calls[1];
		const [newSelectionQuery] = mockGetAllAsync.mock.calls[2];

		expect(selectionQuery).toMatch(/LEFT JOIN userWords AS uw/);
		expect(selectionQuery).toMatch(/COALESCE\(uw\.correctCount, 0\) >= 3/);
		expect(selectionQuery).toMatch(/COALESCE\(uw\.correctCount, 0\) < 7/);
		expect(unseenSelectionQuery).toMatch(
			/COALESCE\(uw\.correctCount, 0\) = 0 AND COALESCE\(uw\.seenCount, 0\) = 0/,
		);
		expect(newSelectionQuery).toMatch(
			/COALESCE\(uw\.correctCount, 0\) > 0 OR COALESCE\(uw\.seenCount, 0\) > 0/,
		);
		expect(newSelectionQuery).toMatch(/COALESCE\(uw\.correctCount, 0\) < 3/);
		expect(userId).toBe('user_one');
		expect(wordIds).toEqual(deck.wordIds);
	});

	test('loads word progress by id as an object lookup', async () => {
		mockGetAllAsync.mockResolvedValueOnce([
			{ wordId: 'word_new', correctCount: 0, seenCount: 1 },
			{ wordId: 'word_bronze', correctCount: 3, seenCount: 0 },
			{ wordId: 'word_silver', correctCount: 7, seenCount: 1 },
		]);

		const progressByWordId = await getWordProgressById({
			userId: 'user_one',
			story: [
				{ text: 'New', wordId: 'word_new' },
				{ text: 'Unseen', wordId: 'word_unseen' },
				{ text: 'Bronze', wordId: 'word_bronze' },
				{ text: 'Silver', wordId: 'word_silver' },
				{ text: 'Bronze again', wordId: 'word_bronze' },
				{ text: '.' },
			],
		});

		const [rankQuery, userId, ...wordIds] = mockGetAllAsync.mock.calls[0];

		expect(rankQuery).toMatch(/FROM userWords/);
		expect(rankQuery).toMatch(/wordId IN \([^)]*\)/);
		expect(userId).toBe('user_one');
		expect(wordIds).toEqual([
			'word_new',
			'word_unseen',
			'word_bronze',
			'word_silver',
		]);
		expect(progressByWordId).toEqual({
			word_new: 'fnew',
			word_unseen: 'unseen',
			word_bronze: 'bronze',
			word_silver: 'silver',
		});
	});

	test('skips word rank query when there are no word ids', async () => {
		const progressByWordId = await getWordProgressById({
			userId: 'user_one',
			story: [{ text: '.' }],
		});

		expect(progressByWordId).toEqual({});
		expect(mockGetAllAsync).not.toHaveBeenCalled();
	});

	test('returns an empty object when story is undefined', async () => {
		const progressByWordId = await getWordProgressById({
			userId: 'user_one',
			story: undefined,
		});

		expect(progressByWordId).toEqual({});
		expect(mockGetAllAsync).not.toHaveBeenCalled();
	});
});
