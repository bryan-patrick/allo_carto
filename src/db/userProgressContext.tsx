import type {
	DeckCompletionReceiptProps,
	WordAnswerAwardProps,
} from '@/src/components/CardDeck/deckSessionTypes';
import type {
	SolveAttemptRequest,
	SolveAttemptResult,
	SolveCardRequest,
} from '@/src/components/Solve/solveTypes';
import type { ProgressById } from '@/src/util/progression';
import { useAppSettings } from '@/src/settings/useAppSettings';
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
import getUserInk from './queries/getUserInk';
import getUserProgress from './queries/getUserProgress';
import unlockSolveCard from './queries/unlockSolveCard';
import writeSolveAttempt from './queries/writeSolveAttempt';
import {
	writeCorrectAnswer,
	writeDeckCompletion,
	writeWordSeen,
	type CorrectAnswerRequest,
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
	inkBalance: number;
	experience: UserExperience;
	isUpdatingProgress: boolean;
	progressById: ProgressById;
	status: ProgressStatus;
	writeCorrectAnswer: (request: CorrectAnswerRequest) => Promise<WordAnswerAwardProps | false>;
	writeDeckCompletion: (
		request: DeckCompletionRequest,
	) => Promise<DeckCompletionReceiptProps | false>;
	writeWordSeen: (wordId: string, deckId?: string) => Promise<boolean>;
	writeSolveAttempt: (request: SolveAttemptRequest) => Promise<SolveAttemptResult | false>;
	unlockSolveCard: (request: SolveCardRequest) => Promise<SolveAttemptResult | false>;
	reloadProgress: () => Promise<void>;
}

/**
 * Initial progress state
 */
const initialValue: UserProgressContextProps = {
	inkBalance: 0,
	experience: getUserExperience(0),
	isUpdatingProgress: false,
	progressById: {},
	status: 'loading',
	writeCorrectAnswer: async () => false,
	writeDeckCompletion: async () => false,
	writeWordSeen: async () => false,
	writeSolveAttempt: async () => false,
	unlockSolveCard: async () => false,
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
	const { settings } = useAppSettings();
	const fastSolveUnlocks = settings.fastSolveUnlocks;

	/**
	 * State
	 */
	const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
	const [progressById, setProgressById] = useState<ProgressById>({});
	const [experience, setExperience] = useState<UserExperience>(() => getUserExperience(0));
	const [inkBalance, setInkBalance] = useState(0);
	const [status, setStatus] = useState<ProgressStatus>('loading');
	const isSavingProgress = useRef(false);

	/**
	 * Reload vocabulary progress, XP, and Ink after saving an answer.
	 */
	const refreshProgress = useCallback(async () => {
		if (!userId) {
			return;
		}

		return Promise.all([
			getUserProgress({ database, userId }),
			loadUserXP({ database, userId }),
			getUserInk({ database, userId }),
		])
			.then(([nextProgress, nextExperience, nextInkBalance]) => {
				setProgressById(nextProgress);
				setExperience(nextExperience);
				setInkBalance(nextInkBalance);
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
			if (!userId || isSavingProgress.current) {
				return false;
			}

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
		async (request: CorrectAnswerRequest): Promise<WordAnswerAwardProps | false> => {
			return runProgressWrite(async () => {
				return writeCorrectAnswer({ database, userId: userId!, ...request });
			});
		},
		[database, runProgressWrite, userId],
	);

	/**
	 * Save the deck completion bonus and update the player's level
	 */
	const recordDeckCompletion = useCallback(
		async (request: DeckCompletionRequest): Promise<DeckCompletionReceiptProps | false> => {
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
		async (wordId: string, deckId?: string): Promise<boolean> => {
			return runProgressWrite(async () => {
				await writeWordSeen({ database, userId: userId!, wordId, deckId });
				return true;
			});
		},
		[database, runProgressWrite, userId],
	);

	/**
	 * Write the solve attempt to the db
	 */
	const recordSolveAttempt = useCallback(
		async (request: SolveAttemptRequest): Promise<SolveAttemptResult | false> => {
			return runProgressWrite(() =>
				writeSolveAttempt({
					database,
					userId: userId!,
					...request,
					fastSolveUnlocks,
				}),
			);
		},
		[database, runProgressWrite, userId, fastSolveUnlocks],
	);

	/**
	 * Unlocking a puzzle card updates the shared Ink balance after it saves.
	 */
	const recordSolveUnlock = useCallback(
		async (request: SolveCardRequest): Promise<SolveAttemptResult | false> => {
			return runProgressWrite(() =>
				unlockSolveCard({
					database,
					userId: userId!,
					...request,
					fastSolveUnlocks,
				}),
			);
		},
		[database, runProgressWrite, userId, fastSolveUnlocks],
	);

	/**
	 * Context value
	 */
	const value = useMemo<UserProgressContextProps>(
		() => ({
			inkBalance,
			experience,
			isUpdatingProgress,
			progressById,
			writeCorrectAnswer: recordCorrectAnswer,
			writeDeckCompletion: recordDeckCompletion,
			writeWordSeen: recordWordSeen,
			writeSolveAttempt: recordSolveAttempt,
			unlockSolveCard: recordSolveUnlock,
			reloadProgress: refreshProgress,
			status,
		}),
		[
			inkBalance,
			experience,
			isUpdatingProgress,
			progressById,
			recordCorrectAnswer,
			recordDeckCompletion,
			recordWordSeen,
			recordSolveAttempt,
			recordSolveUnlock,
			refreshProgress,
			status,
		],
	);

	/**
	 * Render the provider
	 */
	return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
}
