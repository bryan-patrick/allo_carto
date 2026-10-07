import type {
	DeckCompletionReceipt,
	WordAnswerAward,
} from '@/src/components/CardDeck/deckSessionTypes';
import type { ProgressById } from '@/src/util/progression';
import { getUserExperience, type UserExperience } from '@/src/util/userExperience';
import { useSQLiteContext } from 'expo-sqlite';
import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import loadUserXP from './queries/getUserExperience';
import getUserProgress from './queries/getUserProgress';
import {
	writeCorrectAnswer,
	writeDeckCompletion,
	writeWordSeen,
	type DeckCompletionRequest,
} from './queries/writeUserProgress';

/**
 * Typing
 */
type ProgressStatus = 'loading' | 'ready' | 'error';

interface UserProgressProviderProps {
	children: ReactNode;
	userId?: string;
}

interface UserProgressContextProps {
	experience: UserExperience;
	isUpdatingProgress: boolean;
	progressById: ProgressById;
	status: ProgressStatus;
	writeCorrectAnswer: (wordId: string) => Promise<WordAnswerAward | false>;
	writeDeckCompletion: (request: DeckCompletionRequest) => Promise<DeckCompletionReceipt | false>;
	writeWordSeen: (wordId: string) => Promise<boolean>;
	reloadProgress: () => Promise<void>;
}

/**
 * Initial progress state
 */
const initialValue: UserProgressContextProps = {
	experience: getUserExperience(0),
	isUpdatingProgress: false,
	progressById: {},
	status: 'loading',
	writeCorrectAnswer: async () => false,
	writeDeckCompletion: async () => false,
	writeWordSeen: async () => false,
	reloadProgress: async () => {},
};

export const UserProgressContext = createContext<UserProgressContextProps>(initialValue);

/**
 * Provide the current user's saved progress and XP to the app.
 */
export function UserProgressProvider({ children, userId }: UserProgressProviderProps) {
	return (
		<UserProgressState
			key={userId}
			userId={userId}
		>
			{children}
		</UserProgressState>
	);
}

/**
 * Load and save progress for the current user.
 */
function UserProgressState({ children, userId }: UserProgressProviderProps) {
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
	 * Reload content progress and player experience from the database. State
	 * changes only in the database promise's completion callbacks.
	 */
	const refreshProgress = useCallback(async () => {
		if (!userId) return;

		return Promise.all([getUserProgress({ database, userId }), loadUserXP({ database, userId })])
			.then(([nextProgress, nextExperience]) => {
				setProgressById(nextProgress);
				setExperience(nextExperience);
				setStatus('ready');
			})
			.catch(error => {
				console.error('Could not retrieve user progress:', error);
				setStatus('error');
			});
	}, [database, userId]);

	/**
	 * Load userProgress rows when the database is ready
	 */
	useEffect(() => {
		refreshProgress();
	}, [refreshProgress]);

	/**
	 * Block another word or userProgress write until the current database progress saves
	 */
	const runProgressWrite = useCallback(
		async function saveProgress<T>(write: () => Promise<T>): Promise<T | false> {
			if (!userId || isSavingProgress.current) return false;

			isSavingProgress.current = true;
			setIsUpdatingProgress(true);

			try {
				const result = await write();
				await refreshProgress();
				return result;
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
		async (wordId: string): Promise<WordAnswerAward | false> => {
			return runProgressWrite(async () => {
				return writeCorrectAnswer({ database, userId: userId!, wordId });
			});
		},
		[database, runProgressWrite, userId],
	);

	/**
	 * Save the deck completion bonus and update the player's level
	 */
	const recordDeckCompletion = useCallback(
		async (request: DeckCompletionRequest): Promise<DeckCompletionReceipt | false> => {
			return runProgressWrite(async () => {
				return writeDeckCompletion({ database, userId: userId!, ...request });
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
				return true;
			});
		},
		[database, runProgressWrite, userId],
	);

	/**
	 * Context value
	 */
	const value = useMemo<UserProgressContextProps>(
		() => ({
			experience,
			isUpdatingProgress,
			progressById,
			writeCorrectAnswer: recordCorrectAnswer,
			writeDeckCompletion: recordDeckCompletion,
			writeWordSeen: recordWordSeen,
			reloadProgress: refreshProgress,
			status,
		}),
		[
			experience,
			isUpdatingProgress,
			progressById,
			recordCorrectAnswer,
			recordDeckCompletion,
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
