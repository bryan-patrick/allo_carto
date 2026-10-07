import type { WordAnswerAwardProps } from '@/src/components/CardDeck/deckSessionTypes';
import loadUserXP from '@/src/db/queries/getUserExperience';
import getUserProgress from '@/src/db/queries/getUserProgress';
import { writeCorrectAnswer } from '@/src/db/queries/writeUserProgress';
import { useUserProgress } from '@/src/db/useUserProgress';
import { UserProgressProvider } from '@/src/db/userProgressContext';
import { getUserExperience } from '@/src/util/userExperience';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

jest.mock('@/src/db/queries/getUserExperience');
jest.mock('@/src/db/queries/getUserProgress');
jest.mock('@/src/db/queries/writeUserProgress', () => ({
	writeCorrectAnswer: jest.fn(),
	writeDeckCompletion: jest.fn(),
	writeWordSeen: jest.fn(),
}));
jest.mock('expo-sqlite', () => {
	const database = {};
	return { useSQLiteContext: () => database };
});

const mockGetUserProgress = jest.mocked(getUserProgress);
const mockLoadUserExperience = jest.mocked(loadUserXP);
const mockWriteCorrectAnswer = jest.mocked(writeCorrectAnswer);
const savedAward: WordAnswerAwardProps = {
	xp: 10,
	learningBonusXP: 0,
	previousProgress: 'learning',
	nextProgress: 'learning',
};

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
		mockLoadUserExperience.mockResolvedValue(getUserExperience(0));
		mockGetUserProgress.mockResolvedValue({});
	});

	test('starts only one write when input is repeated before React rerenders', async () => {
		/**
		 * Keep the first write pending so a second press reaches the
		 * synchronous in-flight guard before React can rerender.
		 */
		const pendingWrite = deferred<WordAnswerAwardProps>();
		mockWriteCorrectAnswer.mockReturnValue(pendingWrite.promise);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		let firstWrite!: Promise<WordAnswerAwardProps | false>;
		let secondWrite!: Promise<WordAnswerAwardProps | false>;
		await act(() => {
			firstWrite = result.current.writeCorrectAnswer('word_one');
			secondWrite = result.current.writeCorrectAnswer('word_one');
		});

		await expect(secondWrite).resolves.toBe(false);
		expect(mockWriteCorrectAnswer).toHaveBeenCalledTimes(1);
		expect(result.current.isUpdatingProgress).toBe(true);

		pendingWrite.resolve(savedAward);
		await act(async () => {
			await expect(firstWrite).resolves.toEqual(savedAward);
		});

		expect(result.current.isUpdatingProgress).toBe(false);
		expect(mockGetUserProgress).toHaveBeenCalledTimes(2);
	});

	test('keeps input blocked until refreshed progress is loaded', async () => {
		/**
		 * Let the write finish immediately, then pause the refresh that follows it.
		 */
		const pendingRefresh = deferred<any>();
		mockWriteCorrectAnswer.mockResolvedValue(savedAward);
		mockGetUserProgress.mockResolvedValueOnce({}).mockReturnValueOnce(pendingRefresh.promise);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		let firstWrite!: Promise<WordAnswerAwardProps | false>;
		await act(() => {
			firstWrite = result.current.writeCorrectAnswer('word_one');
		});
		await waitFor(() => expect(mockGetUserProgress).toHaveBeenCalledTimes(2));

		expect(result.current.isUpdatingProgress).toBe(true);
		await expect(result.current.writeCorrectAnswer('word_two')).resolves.toBe(false);

		pendingRefresh.resolve({});
		await act(async () => {
			await expect(firstWrite).resolves.toEqual(savedAward);
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
			.mockResolvedValueOnce(savedAward);
		const { result } = await renderHook(() => useUserProgress(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.status).toBe('ready'));

		await act(async () => {
			await expect(result.current.writeCorrectAnswer('word_one')).resolves.toBe(false);
		});
		expect(result.current.isUpdatingProgress).toBe(false);

		await act(async () => {
			await expect(result.current.writeCorrectAnswer('word_two')).resolves.toEqual(savedAward);
		});
		expect(mockWriteCorrectAnswer).toHaveBeenCalledTimes(2);
		consoleError.mockRestore();
	});
});
