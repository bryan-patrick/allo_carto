import type { ProgressById } from '@/src/util/progression';
import { getUserExperience, type UserExperience } from '@/src/util/userExperience';
import { useSQLiteContext } from 'expo-sqlite';
import {
	createContext,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import loadUserXP from './queries/getUserExperience';
import getUserProgress from './queries/getUserProgress';
import { writeCorrectAnswer, writeWordSeen } from './queries/writeUserProgress';

/**
 * Typing
 */
type ProgressStatus = 'loading' | 'ready' | 'error';

interface UserProgressContextValue {
	experience: UserExperience;
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
	experience: getUserExperience(0),
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
	userId,
}: {
	children: ReactNode;
	userId?: string;
}) {
	const database = useSQLiteContext();

	/**
	 * State
	 */
	const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
	const [progressById, setProgressById] = useState<ProgressById>({});
	const [experience, setExperience] = useState<UserExperience>(() => getUserExperience(0));
	const [status, setStatus] = useState<ProgressStatus>('loading');
	const isSavingProgress = useRef(false);

	/**
	 * Reload content progress and player experience from the database
	 */
	const refreshProgress = useCallback(async () => {
		if (!userId) {
			setProgressById({});
			setExperience(getUserExperience(0));
			setStatus('loading');
		} else {
			try {
				const [nextProgress, nextExperience] = await Promise.all([
					getUserProgress({ database, userId }),
					loadUserXP({ database, userId }),
				]);

				setProgressById(nextProgress);
				setExperience(nextExperience);
				setStatus('ready');
			} catch (error) {
				console.error('Could not retrieve user progress:', error);
				setStatus('error');
			}
		}
	}, [database, userId]);

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
				await writeCorrectAnswer({ database, userId: userId!, wordId });
			});
		},
		[database, runProgressWrite, userId],
	);

	/**
	 * Save that a word was seen
	 */
	const recordWordSeen = useCallback(
		async (wordId: string): Promise<boolean> => {
			return runProgressWrite(async () => {
				await writeWordSeen({ database, userId: userId!, wordId });
			});
		},
		[database, runProgressWrite, userId],
	);

	/**
	 * Context value
	 */
	const value = useMemo<UserProgressContextValue>(
		() => ({
			experience,
			isUpdatingProgress,
			progressById,
			writeCorrectAnswer: recordCorrectAnswer,
			writeWordSeen: recordWordSeen,
			reloadProgress: refreshProgress,
			status,
		}),
		[
			experience,
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
