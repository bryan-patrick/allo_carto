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

	test('loads word progress and queries repeated passage words once', async () => {
		mockGetAllAsync.mockResolvedValueOnce([
			{ wordId: 'word_new', correctCount: 0, seenCount: 1 },
			{ wordId: 'word_learning', correctCount: 3, seenCount: 0 },
			{ wordId: 'word_familiar', correctCount: 7, seenCount: 1 },
		]);

		const progressByWordId = await getWordProgressById({
			userId: 'user_one',
			passage: [
				{ text: 'New', wordId: 'word_new' },
				{ text: 'Unseen', wordId: 'word_unseen' },
				{ text: 'Learning', wordId: 'word_learning' },
				{ text: 'Familiar', wordId: 'word_familiar' },
				{ text: 'Learning again', wordId: 'word_learning' },
				{ text: '.' },
			],
		});

		const [, userId, ...wordIds] = mockGetAllAsync.mock.calls[0];

		expect(userId).toBe('user_one');
		expect(wordIds).toEqual(['word_new', 'word_unseen', 'word_learning', 'word_familiar']);
		expect(progressByWordId).toEqual({
			word_new: 'new',
			word_unseen: 'unseen',
			word_learning: 'learning',
			word_familiar: 'familiar',
		});
	});
});
