import getUserProgress from '@/src/db/queries/getUserProgress';
import { writeCorrectAnswer } from '@/src/db/queries/writeUserProgress';
import { useUserProgress } from '@/src/db/useUserProgress';
import { UserProgressProvider } from '@/src/db/userProgressContext';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

jest.mock('@/src/db/queries/getUserProgress');
jest.mock('@/src/db/queries/writeUserProgress', () => ({
	writeCorrectAnswer: jest.fn(),
	writeWordSeen: jest.fn(),
}));
jest.mock('expo-sqlite', () => {
	const database = {};
	return { useSQLiteContext: () => database };
});

const mockGetUserProgress = jest.mocked(getUserProgress);
const mockWriteCorrectAnswer = jest.mocked(writeCorrectAnswer);

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((promiseResolve, promiseReject) => {
		resolve = promiseResolve;
		reject = promiseReject;
	});

	return { promise, reject, resolve };
}

function Wrapper({ children }: { children: ReactNode }) {
	return <UserProgressProvider userId="user_one">{children}</UserProgressProvider>;
}

describe('<UserProgressProvider />', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetUserProgress.mockResolvedValue({});
	});

	test('starts only one write when input is repeated before React rerenders', async () => {
		/**
		 * Keep the first write pending so a second press reaches the
		 * synchronous in-flight guard before React can rerender.
		 */
		const pendingWrite = deferred<void>();
		mockWriteCorrectAnswer.mockReturnValue(pendingWrite.promise);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		let firstWrite!: Promise<boolean>;
		let secondWrite!: Promise<boolean>;
		await act(() => {
			firstWrite = result.current.writeCorrectAnswer('word_one');
			secondWrite = result.current.writeCorrectAnswer('word_one');
		});

		await expect(secondWrite).resolves.toBe(false);
		expect(mockWriteCorrectAnswer).toHaveBeenCalledTimes(1);
		expect(result.current.isUpdatingProgress).toBe(true);

		pendingWrite.resolve();
		await act(async () => {
			await expect(firstWrite).resolves.toBe(true);
		});

		expect(result.current.isUpdatingProgress).toBe(false);
		expect(mockGetUserProgress).toHaveBeenCalledTimes(2);
	});

	test('keeps input blocked until refreshed progress is loaded', async () => {
		/**
		 * Let the write finish immediately, then pause the refresh that follows it.
		 */
		const pendingRefresh = deferred<any>();
		mockWriteCorrectAnswer.mockResolvedValue(undefined);
		mockGetUserProgress.mockResolvedValueOnce({}).mockReturnValueOnce(pendingRefresh.promise);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		let firstWrite!: Promise<boolean>;
		await act(() => {
			firstWrite = result.current.writeCorrectAnswer('word_one');
		});
		await waitFor(() => expect(mockGetUserProgress).toHaveBeenCalledTimes(2));

		expect(result.current.isUpdatingProgress).toBe(true);
		await expect(result.current.writeCorrectAnswer('word_two')).resolves.toBe(false);

		pendingRefresh.resolve({});
		await act(async () => {
			await expect(firstWrite).resolves.toBe(true);
		});
		expect(result.current.isUpdatingProgress).toBe(false);
	});

	test('releases the write block after a failed write', async () => {
		/**
		 * The provider reports expected write failures, so silence that output here.
		 */
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockWriteCorrectAnswer
			.mockRejectedValueOnce(new Error('write failed'))
			.mockResolvedValueOnce(undefined);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		await act(async () => {
			await expect(result.current.writeCorrectAnswer('word_one')).resolves.toBe(false);
		});
		expect(result.current.isUpdatingProgress).toBe(false);

		await act(async () => {
			await expect(result.current.writeCorrectAnswer('word_two')).resolves.toBe(true);
		});
		expect(mockWriteCorrectAnswer).toHaveBeenCalledTimes(2);
		consoleError.mockRestore();
	});
});
