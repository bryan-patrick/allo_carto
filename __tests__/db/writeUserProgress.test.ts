import { getDB } from '@/src/db/connection';
import getDeckRankCounts from '@/src/db/queries/getDeckRankCounts';
import { incrementCorrectCount } from '@/src/db/queries/incrementCorrectCount';
import { incrementSeenCount } from '@/src/db/queries/incrementSeenCount';
import updateUserProgress from '@/src/db/queries/updateUserProgress';
import {
	writeCorrectAnswer,
	writeWordSeen,
} from '@/src/db/queries/writeUserProgress';
import { getProgressItemsForWord } from '@/src/util/atlasProgression';

/**
 * Mock the transaction
 */
const mockTransaction = {
	getFirstAsync: jest.fn(),
};
const mockWithExclusiveTransactionAsync = jest.fn(
	async (operation: (transaction: typeof mockTransaction) => Promise<void>) => {
		await operation(mockTransaction);
	},
);

/**
 * Mock the queries
 */
jest.mock('@/src/db/connection', () => ({
	getDB: jest.fn(),
}));
jest.mock('@/src/db/queries/getDeckRankCounts');
jest.mock('@/src/db/queries/incrementCorrectCount');
jest.mock('@/src/db/queries/incrementSeenCount');
jest.mock('@/src/db/queries/updateUserProgress');
jest.mock('@/src/util/atlasProgression');

/**
 * Typed mocks
 */
const mockGetDB = jest.mocked(getDB);
const mockGetDeckRankCounts = jest.mocked(getDeckRankCounts);
const mockIncrementCorrectCount = jest.mocked(incrementCorrectCount);
const mockIncrementSeenCount = jest.mocked(incrementSeenCount);
const mockUpdateUserProgress = jest.mocked(updateUserProgress);
const mockGetProgressItemsForWord = jest.mocked(getProgressItemsForWord);

describe('progress writes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetDB.mockResolvedValue({
			withExclusiveTransactionAsync: mockWithExclusiveTransactionAsync,
		} as unknown as Awaited<ReturnType<typeof getDB>>);
		mockIncrementCorrectCount.mockResolvedValue(undefined);
		mockIncrementSeenCount.mockResolvedValue(undefined);
		mockUpdateUserProgress.mockResolvedValue(undefined);
		mockGetDeckRankCounts.mockResolvedValue({
			seen: 1,
			fnew: 3,
			bronze: 1,
			silver: 0,
			gold: 0,
			diamond: 0,
		});
		mockGetProgressItemsForWord.mockReturnValue([
			{
				id: 'deck_one',
				type: 'deck',
				wordIds: ['word_one', 'word_two', 'word_three', 'word_four'],
			},
			{
				id: 'place_one',
				type: 'place',
				wordIds: ['word_one', 'word_two', 'word_three', 'word_four'],
			},
			{
				id: 'chapter_one',
				type: 'chapter',
				wordIds: ['word_one', 'word_two', 'word_three', 'word_four'],
			},
		]);
	});

	test('recalculates every affected row inside one exclusive transaction after a rank change', async () => {
		mockTransaction.getFirstAsync.mockResolvedValue({ correctCount: 2 });

		await expect(writeCorrectAnswer({
			userId: 'user_one',
			wordId: 'word_one',
		})).resolves.toEqual({ rankChanged: true });

		expect(mockWithExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
		expect(mockIncrementCorrectCount).toHaveBeenCalledWith(
			'user_one',
			'word_one',
			mockTransaction,
		);
		expect(mockGetProgressItemsForWord).toHaveBeenCalledWith({
			wordId: 'word_one',
		});
		expect(mockGetDeckRankCounts).toHaveBeenCalledTimes(3);
		expect(mockUpdateUserProgress).toHaveBeenCalledTimes(3);
		expect(mockUpdateUserProgress).toHaveBeenNthCalledWith(1, {
			completionPercentage: 6.25,
			database: mockTransaction,
			item: expect.objectContaining({ id: 'deck_one', type: 'deck' }),
			userId: 'user_one',
		});
	});

	test('does not recalculate progress when the answer stays in the same rank', async () => {
		mockTransaction.getFirstAsync.mockResolvedValue({ correctCount: 3 });

		await expect(writeCorrectAnswer({
			userId: 'user_one',
			wordId: 'word_one',
		})).resolves.toEqual({ rankChanged: false });

		expect(mockIncrementCorrectCount).toHaveBeenCalledTimes(1);
		expect(mockGetProgressItemsForWord).not.toHaveBeenCalled();
		expect(mockGetDeckRankCounts).not.toHaveBeenCalled();
		expect(mockUpdateUserProgress).not.toHaveBeenCalled();
	});

	test('records seen progress exclusively without changing completion', async () => {
		await writeWordSeen({ userId: 'user_one', wordId: 'word_one' });

		expect(mockWithExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
		expect(mockIncrementSeenCount).toHaveBeenCalledWith(
			'user_one',
			'word_one',
			mockTransaction,
		);
		expect(mockGetDeckRankCounts).not.toHaveBeenCalled();
		expect(mockUpdateUserProgress).not.toHaveBeenCalled();
	});
});
