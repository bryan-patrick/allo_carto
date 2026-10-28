import type {
	SavedWordOrderAttempt,
	SolveWordOrderPuzzle,
} from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getCompletedSolveStages, getSolveStageEligibility } from '@/src/util/solveProgression';
import { getWordOrderCards, readWordOrder, shuffleWordOrder } from '@/src/util/solveWordOrder';
import type { SQLiteDatabase } from 'expo-sqlite';
import loadUserXP from './getUserExperience';
import getUserProgress from './getUserProgress';

/**
 * Typing
 */
interface GetSolveWordOrderPuzzleOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	fastSolveUnlocks: boolean;
}

interface WordOrderDraftRow {
	positions: string;
}

interface WordOrderAttemptRow {
	answer: string;
	inkSpent: number;
	status: 'exact' | 'incorrect';
}

/**
 * Loads a paragraph's Solve++ cards, saved arrangement, last result, and unlock requirements.
 */
export default async function getSolveWordOrderPuzzle({
	database,
	userId,
	deckId,
	fastSolveUnlocks,
}: GetSolveWordOrderPuzzleOptions): Promise<SolveWordOrderPuzzle> {
	const statements = {
		getDraft: `
			SELECT positions FROM solveWordOrderDrafts
			WHERE userId = ? AND deckId = ?;
		`,
		getLastAttempt: `
			SELECT answer, inkSpent, status FROM solveStageAttempts
			WHERE userId = ? AND deckId = ? AND stage = 3
			ORDER BY rowid DESC LIMIT 1;
		`,
	};

	const deck = findParagraphById(deckId);
	let lastAttempt: SavedWordOrderAttempt | null = null;

	if (!deck) {
		throw new Error('This paragraph could not be found.');
	}

	const cards = getWordOrderCards(deck);
	const progressById = await getUserProgress({
		database,
		userId,
	});
	const experience = await loadUserXP({
		database,
		userId,
	});
	const progress = progressById[deckId];
	const completedSolveStages = getCompletedSolveStages(progress);
	const isParagraphUnlocked = isItemUnlocked({
		id: deckId,
		progressById,
	});
	const eligibility = getSolveStageEligibility({
		stage: 3,
		completedStages: completedSolveStages,
		playerLevel: experience.level,
		fastSolveUnlocks,
		isParagraphUnlocked,
		wordCount: deck.wordIds.length,
		seenWordCount: progress?.seenWordCount ?? 0,
	});
	const savedDraft = await database.getFirstAsync<WordOrderDraftRow>(
		statements.getDraft,
		userId,
		deckId,
	);
	const savedAttempt = await database.getFirstAsync<WordOrderAttemptRow>(
		statements.getLastAttempt,
		userId,
		deckId,
	);
	const savedPositions = savedDraft ? readWordOrder(savedDraft.positions, cards) : null;
	const positions = savedPositions ?? shuffleWordOrder(deck);
	const attemptedPositions = savedAttempt ? readWordOrder(savedAttempt.answer, cards) : null;

	if (savedAttempt && attemptedPositions) {
		lastAttempt = {
			positions: attemptedPositions,
			inkSpent: savedAttempt.inkSpent,
			status: savedAttempt.status,
		};
	}

	return {
		...eligibility,
		deck,
		isUnlocked: isParagraphUnlocked,
		cards,
		positions,
		completedSolveStages,
		lastAttempt,
	};
}
