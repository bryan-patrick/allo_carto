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
import { writeCorrectAnswer, writeWordSeen } from './queries/writeUserProgress';

/**
 * Typing
 */
type ProgressStatus = 'loading' | 'ready' | 'error';

interface UserProgressContextValue {
	isUpdatingProgress: boolean;
	progressById: ProgressById;
	status: ProgressStatus;
	writeCorrectAnswer: (wordId: string) => Promise<boolean>;
	writeWordSeen: (wordId: string) => Promise<boolean>;
	reloadProgress: () => Promise<void>;
}

/**
 * Initial progress state
 */
const initialValue: UserProgressContextValue = {
	isUpdatingProgress: false,
	progressById: {},
	status: 'loading',
	writeCorrectAnswer: async () => true,
	writeWordSeen: async () => true,
	reloadProgress: async () => {},
};

export const UserProgressContext = createContext<UserProgressContextValue>(initialValue);

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
	const isSavingProgress = useRef(false);

	/**
	 * Reload userProgress rows from the database
	 */
	const refreshProgress = useCallback(async () => {
		if (!isDatabaseReady || !userId) {
			setProgressById({});
			setStatus('loading');
		} else {
			try {
				setProgressById(await getUserProgress(userId));
				setStatus('ready');
			} catch (error) {
				console.error('Could not retrieve user progress:', error);
				setStatus('error');
			}
		}
	}, [isDatabaseReady, userId]);

	/**
	 * Load userProgress rows when the database is ready
	 */
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		refreshProgress();
	}, [refreshProgress]);

	/**
	 * Block another word or userProgress write until the database write finishes
	 */
	const runProgressWrite = useCallback(
		async (write: () => Promise<void>): Promise<boolean> => {
			if (!userId || isSavingProgress.current) return false;

			isSavingProgress.current = true;
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
				isSavingProgress.current = false;
				setIsUpdatingProgress(false);
			}
		},
		[refreshProgress, userId],
	);

	/**
	 * Save a correct answer
	 */
	const recordCorrectAnswer = useCallback(
		async (wordId: string): Promise<boolean> => {
			return runProgressWrite(async () => {
				await writeCorrectAnswer({ userId: userId!, wordId });
			});
		},
		[runProgressWrite, userId],
	);

	/**
	 * Save that a word was seen
	 */
	const recordWordSeen = useCallback(
		async (wordId: string): Promise<boolean> => {
			return runProgressWrite(async () => {
				await writeWordSeen({ userId: userId!, wordId });
			});
		},
		[runProgressWrite, userId],
	);

	/**
	 * Context value
	 */
	const value = useMemo<UserProgressContextValue>(
		() => ({
			isUpdatingProgress,
			progressById,
			writeCorrectAnswer: recordCorrectAnswer,
			writeWordSeen: recordWordSeen,
			reloadProgress: refreshProgress,
			status,
		}),
		[
			isUpdatingProgress,
			progressById,
			recordCorrectAnswer,
			recordWordSeen,
			refreshProgress,
			status,
		],
	);

	/**
	 * Render the provider
	 */
	return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
}
