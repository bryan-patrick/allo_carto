import type { ProgressById } from '@/src/util/progression';
import {
	createContext,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import getUserProgress from './queries/getUserProgress';
import {
	writeCorrectAnswer,
	writeWordSeen,
} from './queries/writeUserProgress';

/**
 * Typing
 */
type ProgressStatus = 'loading' | 'ready' | 'error';

interface UserProgressContextValue {
	isUpdatingProgress: boolean;
	progressById: ProgressById;
	recordCorrectAnswer: (wordId: string) => Promise<boolean>;
	recordWordSeen: (wordId: string) => Promise<boolean>;
	refreshProgress: () => Promise<void>;
	status: ProgressStatus;
}

/**
 * Initial progress state
 */
const initialValue: UserProgressContextValue = {
	isUpdatingProgress: false,
	progressById: {},
	recordCorrectAnswer: async () => true,
	recordWordSeen: async () => true,
	refreshProgress: async () => {},
	status: 'loading',
};

export const UserProgressContext =
	createContext<UserProgressContextValue>(initialValue);

/**
 * User progress provider
 */
export function UserProgressProvider({
	children,
	isDatabaseReady,
	userId,
}: {
	children: ReactNode;
	isDatabaseReady: boolean;
	userId?: string;
}) {
	/**
	 * State
	 */
	const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
	const [progressById, setProgressById] = useState<ProgressById>({});
	const [status, setStatus] = useState<ProgressStatus>('loading');
	const progressWriteInFlight = useRef(false);

	/**
	 * Refresh progress from the database
	 */
	const refreshProgress = useCallback(async () => {
		if (!isDatabaseReady || !userId) {
			setProgressById({});
			setStatus('loading');
			return;
		}

		try {
			setProgressById(await getUserProgress(userId));
			setStatus('ready');
		} catch (error) {
			console.error('Could not retrieve user progress:', error);
			setStatus('error');
		}
	}, [isDatabaseReady, userId]);

	/**
	 * Load progress when the database is ready
	 */
	useEffect(() => {
		/**
		 * This effect loads our SQLite state
		 */
		// eslint-disable-next-line react-hooks/set-state-in-effect
		refreshProgress();
	}, [refreshProgress]);

	/**
	 * Block progress writes until everything is done
	 */
	const runProgressWrite = useCallback(async (
		write: () => Promise<void>,
	): Promise<boolean> => {
		if (!userId || progressWriteInFlight.current) return false;

		progressWriteInFlight.current = true;
		setIsUpdatingProgress(true);

		try {
			await write();
			await refreshProgress();
			return true;
		} catch (error) {
			console.error('Could not update user progress:', error);
			setStatus('error');
			return false;
		} finally {
			progressWriteInFlight.current = false;
			setIsUpdatingProgress(false);
		}
	}, [refreshProgress, userId]);

	/**
	 * Save a correct answer
	 */
	const recordCorrectAnswer = useCallback(async (
		wordId: string,
	): Promise<boolean> => {
		return runProgressWrite(async () => {
			await writeCorrectAnswer({ userId: userId!, wordId });
		});
	}, [runProgressWrite, userId]);

	/**
	 * Save that a word was seen
	 */
	const recordWordSeen = useCallback(async (
		wordId: string,
	): Promise<boolean> => {
		return runProgressWrite(async () => {
			await writeWordSeen({ userId: userId!, wordId });
		});
	}, [runProgressWrite, userId]);

	/**
	 * Context value
	 */
	const value = useMemo<UserProgressContextValue>(() => ({
		isUpdatingProgress,
		progressById,
		recordCorrectAnswer,
		recordWordSeen,
		refreshProgress,
		status,
	}), [
		isUpdatingProgress,
		progressById,
		recordCorrectAnswer,
		recordWordSeen,
		refreshProgress,
		status,
	]);

	/**
	 * Render the provider
	 */
	return (
		<UserProgressContext.Provider value={value}>
			{children}
		</UserProgressContext.Provider>
	);
}
