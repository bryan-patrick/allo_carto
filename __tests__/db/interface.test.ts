import { getWordProgressById } from '@/src/db/interface';

const mockGetAllAsync = jest.fn();

jest.mock('@/src/db/connection', () => ({
	deleteDB: jest.fn(),
	getDB: jest.fn(async () => ({
		getAllAsync: mockGetAllAsync,
	})),
	logThisIfItFails: jest.fn(async (_message: string, operation: () => Promise<unknown>) =>
		operation(),
	),
	setDB: jest.fn(),
}));

describe('getWordProgressById', () => {
	beforeEach(() => {
		mockGetAllAsync.mockReset();
	});

	test('loads word ranks and queries repeated story words once', async () => {
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

		const [, userId, ...wordIds] = mockGetAllAsync.mock.calls[0];

		expect(userId).toBe('user_one');
		expect(wordIds).toEqual(['word_new', 'word_unseen', 'word_bronze', 'word_silver']);
		expect(progressByWordId).toEqual({
			word_new: 'fnew',
			word_unseen: 'unseen',
			word_bronze: 'bronze',
			word_silver: 'silver',
		});
	});
});
