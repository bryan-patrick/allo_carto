import { useUserProgress } from '@/src/db/useUserProgress';
import { UserProgressProvider } from '@/src/db/userProgressContext';
import getUserProgress from '@/src/db/queries/getUserProgress';
import { writeCorrectAnswer } from '@/src/db/queries/writeUserProgress';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

/**
 * Mock the queries
 */
jest.mock('@/src/db/queries/getUserProgress');
jest.mock('@/src/db/queries/writeUserProgress', () => ({
	writeCorrectAnswer: jest.fn(),
	writeWordSeen: jest.fn(),
}));

const mockGetUserProgress = jest.mocked(getUserProgress);
const mockWriteCorrectAnswer = jest.mocked(writeCorrectAnswer);

/**
 * Make a promise we control
 */
function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((promiseResolve, promiseReject) => {
		resolve = promiseResolve;
		reject = promiseReject;
	});

	return { promise, reject, resolve };
}

/**
 * Wrap the progress hook
 */
function Wrapper({ children }: { children: ReactNode }) {
	return (
		<UserProgressProvider isDatabaseReady userId="user_one">
			{children}
		</UserProgressProvider>
	);
}

describe('<UserProgressProvider />', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetUserProgress.mockResolvedValue({});
	});

	test('starts only one write when input is repeated before React rerenders', async () => {
		const pendingWrite = deferred<{ rankChanged: boolean }>();
		mockWriteCorrectAnswer.mockReturnValue(pendingWrite.promise);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		let firstWrite!: Promise<boolean>;
		let secondWrite!: Promise<boolean>;
		await act(() => {
			firstWrite = result.current.recordCorrectAnswer('word_one');
			secondWrite = result.current.recordCorrectAnswer('word_one');
		});

		await expect(secondWrite).resolves.toBe(false);
		expect(mockWriteCorrectAnswer).toHaveBeenCalledTimes(1);
		expect(result.current.isUpdatingProgress).toBe(true);

		pendingWrite.resolve({ rankChanged: false });
		await act(async () => {
			await expect(firstWrite).resolves.toBe(true);
		});

		expect(result.current.isUpdatingProgress).toBe(false);
		expect(mockGetUserProgress).toHaveBeenCalledTimes(2);
	});

	test('keeps input blocked until refreshed progress is loaded', async () => {
		const pendingRefresh = deferred<{}>();
		mockWriteCorrectAnswer.mockResolvedValue({ rankChanged: true });
		mockGetUserProgress
			.mockResolvedValueOnce({})
			.mockReturnValueOnce(pendingRefresh.promise);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		let firstWrite!: Promise<boolean>;
		await act(() => {
			firstWrite = result.current.recordCorrectAnswer('word_one');
		});
		await waitFor(() => expect(mockGetUserProgress).toHaveBeenCalledTimes(2));

		expect(result.current.isUpdatingProgress).toBe(true);
		await expect(
			result.current.recordCorrectAnswer('word_two'),
		).resolves.toBe(false);

		pendingRefresh.resolve({});
		await act(async () => {
			await expect(firstWrite).resolves.toBe(true);
		});
		expect(result.current.isUpdatingProgress).toBe(false);
	});

	test('releases the write block after a failed write', async () => {
		const consoleError = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});
		mockWriteCorrectAnswer
			.mockRejectedValueOnce(new Error('write failed'))
			.mockResolvedValueOnce({ rankChanged: false });
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		await act(async () => {
			await expect(
				result.current.recordCorrectAnswer('word_one'),
			).resolves.toBe(false);
		});
		expect(result.current.isUpdatingProgress).toBe(false);

		await act(async () => {
			await expect(
				result.current.recordCorrectAnswer('word_two'),
			).resolves.toBe(true);
		});
		expect(mockWriteCorrectAnswer).toHaveBeenCalledTimes(2);
		consoleError.mockRestore();
	});
});
