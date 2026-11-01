import { collectionAtlas } from '@/data/french/collectionAtlas';
import type {
	DeckCompletionReceiptProps,
	WordAnswerAwardProps,
} from '@/src/components/CardDeck/deckSessionTypes';
import type {
	SentenceAttemptRequest,
	SolveAttemptRequest,
	SolveAttemptResult,
	SolveRewardRequest,
	SolveRewardReceipt,
	WordOrderAttemptRequest,
} from '@/src/components/Solve/solveTypes';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getMaxInkBalance } from '@/src/util/ink';
import type { ProgressById } from '@/src/util/progression';
import type { CompletedSolveStages } from '@/src/util/solveProgression';
import { getUserExperience, type UserExperience } from '@/src/util/userExperience';
import {
	getVocabularyCollectionProgress,
	type CollectionRewardClaim,
	type VocabularyCollectionProgress,
} from '@/src/util/vocabularyCollections';
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
import applyMockParagraphProgress from './queries/applyMockParagraphProgress';
import claimCollectionReward, {
	type ClaimCollectionRewardRequest,
	type CollectionRewardReceipt,
} from './queries/claimCollectionReward';
import getCollectionRewardClaims from './queries/getCollectionRewardClaims';
import loadUserXP from './queries/getUserExperience';
import getUserInk from './queries/getUserInk';
import getUserProgress from './queries/getUserProgress';
import getUserWordProgress, { type UserWordProgressById } from './queries/getUserWordProgress';
import writeSentenceAttempt from './queries/writeSentenceAttempt';
import writeSolveAttempt from './queries/writeSolveAttempt';
import { claimSolveReward } from './queries/solveRewards';
import {
	writeCorrectAnswer,
	writeDeckCompletion,
	writeIncorrectAnswer,
	writeWordSeen,
	type CorrectAnswerRequest,
	type DeckCompletionRequest,
	type IncorrectAnswerRequest,
} from './queries/writeUserProgress';
import writeWordOrderAttempt from './queries/writeWordOrderAttempt';

/*
 * Typing
 */
type ProgressStatus = 'loading' | 'ready' | 'error';

interface UserProgressProviderProps {
	children: ReactNode;
	userId?: string;
}

interface UserProgressContextProps {
	claimSolveReward: (request: SolveRewardRequest) => Promise<SolveRewardReceipt | false>;
	applyMockParagraphProgress: (completedStages: CompletedSolveStages) => Promise<number | false>;
	collections: VocabularyCollectionProgress[];
	claimCollectionReward: (
		request: ClaimCollectionRewardRequest,
	) => Promise<CollectionRewardReceipt | false>;
	inkBalance: number;
	maxInkBalance: number;
	experience: UserExperience;
	isUpdatingProgress: boolean;
	progressById: ProgressById;
	status: ProgressStatus;
	writeCorrectAnswer: (request: CorrectAnswerRequest) => Promise<WordAnswerAwardProps | false>;
	writeIncorrectAnswer: (request: IncorrectAnswerRequest) => Promise<boolean>;
	writeDeckCompletion: (
		request: DeckCompletionRequest,
	) => Promise<DeckCompletionReceiptProps | false>;
	writeWordSeen: (wordId: string, deckId?: string) => Promise<boolean>;
	writeSolveAttempt: (request: SolveAttemptRequest) => Promise<SolveAttemptResult | false>;
	writeWordOrderAttempt: (request: WordOrderAttemptRequest) => Promise<SolveAttemptResult | false>;
	writeSentenceAttempt: (request: SentenceAttemptRequest) => Promise<SolveAttemptResult | false>;
	reloadProgress: () => Promise<void>;
}

/*
 * Initial progress state
 */
const initialValue: UserProgressContextProps = {
	claimSolveReward: async () => false,
	applyMockParagraphProgress: async () => false,
	collections: [],
	claimCollectionReward: async () => false,
	inkBalance: 0,
	maxInkBalance: getMaxInkBalance(1),
	experience: getUserExperience(0),
	isUpdatingProgress: false,
	progressById: {},
	status: 'loading',
	writeCorrectAnswer: async () => false,
	writeIncorrectAnswer: async () => false,
	writeDeckCompletion: async () => false,
	writeWordSeen: async () => false,
	writeSolveAttempt: async () => false,
	writeWordOrderAttempt: async () => false,
	writeSentenceAttempt: async () => false,
	reloadProgress: async () => {},
};

export const UserProgressContext = createContext<UserProgressContextProps>(initialValue);

/*
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

/*
 * Load and save progress for the current user.
 */
function UserProgressState({ children, userId }: UserProgressProviderProps) {
	const database = useSQLiteContext();
	const { settings } = useAppSettings();
	const fastSolveUnlocks = settings.fastSolveUnlocks;
	const previewAllStamps = settings.previewAllStamps;

	/*
	 * State
	 */
	const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
	const [progressById, setProgressById] = useState<ProgressById>({});
	const [wordProgressById, setWordProgressById] = useState<UserWordProgressById>({});
	const [collectionClaims, setCollectionClaims] = useState<CollectionRewardClaim[]>([]);
	const [experience, setExperience] = useState<UserExperience>(() => getUserExperience(0));
	const [inkBalance, setInkBalance] = useState(0);
	const [status, setStatus] = useState<ProgressStatus>('loading');
	const isSavingProgress = useRef(false);

	/*
	 * Reloads word levels, collection claims, XP, and Ink to keep progress displays current.
	 */
	const refreshProgress = useCallback(async () => {
		if (!userId) {
			return;
		}

		try {
			const nextWordProgressById = await getUserWordProgress({
				database,
				userId,
			});
			const [nextProgress, nextExperience, nextInkBalance, nextCollectionClaims] =
				await Promise.all([
					getUserProgress({
						database,
						userId,
						wordProgressById: nextWordProgressById,
					}),
					loadUserXP({
						database,
						userId,
					}),
					getUserInk({
						database,
						userId,
					}),
					getCollectionRewardClaims({
						database,
						userId,
					}),
				]);

			setProgressById(nextProgress);
			setWordProgressById(nextWordProgressById);
			setCollectionClaims(nextCollectionClaims);
			setExperience(nextExperience);
			setInkBalance(nextInkBalance);
			setStatus('ready');
		} catch (error) {
			console.error('Could not retrieve user progress:', error);
			setStatus('error');
		}
	}, [database, userId]);

	const collections = useMemo(() => {
		const collectionWordProgressById: UserWordProgressById = {
			...wordProgressById,
		};

		// Reveal unseen stamps for screenshots without writing to saved word progress.
		if (previewAllStamps) {
			for (const collection of collectionAtlas.collections) {
				for (const word of collection.words) {
					const savedProgress = collectionWordProgressById[word.wordId];

					if (!savedProgress || savedProgress === 'unseen') {
						collectionWordProgressById[word.wordId] = 'new';
					}
				}
			}
		}

		return collectionAtlas.collections.map(collection => {
			return getVocabularyCollectionProgress({
				collection,
				wordProgressById: collectionWordProgressById,
				claims: collectionClaims,
			});
		});
	}, [collectionClaims, wordProgressById, previewAllStamps]);

	/*
	 * Load userProgress rows when the database is ready
	 */
	useEffect(() => {
		refreshProgress();
	}, [refreshProgress]);

	/*
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

	/*
	 * Applies a mock paragraph state and reloads progress so gems and chapter access update together.
	 */
	const recordMockParagraphProgress = useCallback(
		async (completedStages: CompletedSolveStages): Promise<number | false> => {
			return runProgressWrite(() => {
				return applyMockParagraphProgress({
					database,
					userId: userId!,
					completedStages,
				});
			});
		},
		[database, runProgressWrite, userId],
	);

	/*
	 * Claims collection XP and refreshes progress to update the album and player level.
	 */
	const recordCollectionReward = useCallback(
		async (request: ClaimCollectionRewardRequest): Promise<CollectionRewardReceipt | false> => {
			if (previewAllStamps) {
				return false;
			}

			return runProgressWrite(() => {
				return claimCollectionReward({
					database,
					userId: userId!,
					...request,
				});
			});
		},
		[database, runProgressWrite, userId, previewAllStamps],
	);

	/*
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

	/*
	 * We save incorrect and skipped cards so reopening a deck keeps those results.
	 */
	const recordIncorrectAnswer = useCallback(
		async (request: IncorrectAnswerRequest): Promise<boolean> => {
			return runProgressWrite(() => {
				return writeIncorrectAnswer({
					database,
					userId: userId!,
					...request,
				});
			});
		},
		[database, runProgressWrite, userId],
	);

	/*
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

	/*
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

	/*
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

	/*
	 * Submits the Solve++ answer using the current unlock setting, then reloads the player's Ink and gems.
	 */
	const recordWordOrderAttempt = useCallback(
		async (request: WordOrderAttemptRequest): Promise<SolveAttemptResult | false> => {
			return runProgressWrite(() =>
				writeWordOrderAttempt({
					database,
					userId: userId!,
					...request,
					fastSolveUnlocks,
				}),
			);
		},
		[database, runProgressWrite, userId, fastSolveUnlocks],
	);

	/*
	 * Submit a sentence answer and reload the player's ink and gems.
	 */
	const recordSentenceAttempt = useCallback(
		async (request: SentenceAttemptRequest): Promise<SolveAttemptResult | false> => {
			return runProgressWrite(() =>
				writeSentenceAttempt({
					database,
					userId: userId!,
					...request,
					fastSolveUnlocks,
				}),
			);
		},
		[database, runProgressWrite, userId, fastSolveUnlocks],
	);

	// Claim puzzle XP and refresh the player's level and earned gems.
	const recordSolveReward = useCallback(
		async (request: SolveRewardRequest): Promise<SolveRewardReceipt | false> => {
			return runProgressWrite(() => {
				return claimSolveReward({
					database,
					userId: userId!,
					...request,
				});
			});
		},
		[database, runProgressWrite, userId],
	);

	/*
	 * Context value
	 */
	const value = useMemo<UserProgressContextProps>(
		() => ({
			claimSolveReward: recordSolveReward,
			applyMockParagraphProgress: recordMockParagraphProgress,
			collections,
			claimCollectionReward: recordCollectionReward,
			inkBalance,
			maxInkBalance: getMaxInkBalance(experience.level),
			experience,
			isUpdatingProgress,
			progressById,
			writeCorrectAnswer: recordCorrectAnswer,
			writeIncorrectAnswer: recordIncorrectAnswer,
			writeDeckCompletion: recordDeckCompletion,
			writeWordSeen: recordWordSeen,
			writeSolveAttempt: recordSolveAttempt,
			writeWordOrderAttempt: recordWordOrderAttempt,
			writeSentenceAttempt: recordSentenceAttempt,
			reloadProgress: refreshProgress,
			status,
		}),
		[
			recordSolveReward,
			recordMockParagraphProgress,
			collections,
			recordCollectionReward,
			inkBalance,
			experience,
			isUpdatingProgress,
			progressById,
			recordCorrectAnswer,
			recordIncorrectAnswer,
			recordDeckCompletion,
			recordWordSeen,
			recordSolveAttempt,
			recordWordOrderAttempt,
			recordSentenceAttempt,
			refreshProgress,
			status,
		],
	);

	/*
	 * Render the provider
	 */
	return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
}
