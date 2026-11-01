import type {
	SavedWordOrderAttempt,
	SolveWordOrderPuzzle,
} from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getCompletedSolveStages, getSolveStageEligibility } from '@/src/util/solveProgression';
import { getWordOrderCards, readWordOrder, shuffleWordOrder } from '@/src/util/solveWordOrder';
import { splitFrenchSentences } from '@/src/util/splitFrenchSentences';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolveStageProgress from './getSolveStageProgress';
import loadUserXP from './getUserExperience';
import getUserProgress from './getUserProgress';
import { getSolveRewards } from './solveRewards';

/*
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

/*
 * Loads the next unfinished sentence, its saved card order, and the Solve++ unlock requirements.
 * Older paragraph arrangements still supply the saved order for each sentence.
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
			WHERE userId = ? AND deckId = ? AND stage = 3 AND position = ?
			ORDER BY rowid DESC LIMIT 1;
		`,
	};

	const deck = findParagraphById(deckId);
	let lastAttempt: SavedWordOrderAttempt | null = null;

	if (!deck) {
		throw new Error('This paragraph could not be found.');
	}

	const paragraphCards = getWordOrderCards(deck);
	const sentenceDefinitions = splitFrenchSentences(deck);

	if (sentenceDefinitions.length === 0) {
		throw new Error('This paragraph has no sentences to solve.');
	}

	const savedStage = await getSolveStageProgress({
		database,
		userId,
		deckId,
		stage: 3,
	});
	const legacyAnswer = savedStage.solvedPositions.find(answer => {
		return answer.position === 0 && readWordOrder(answer.acceptedAnswer, paragraphCards) !== null;
	});
	const solvedSentences = sentenceDefinitions.map((_sentence, position) => {
		const savedAnswer = savedStage.solvedPositions.find(answer => answer.position === position);
		const sentenceCards = getWordOrderCards(deck, position);

		return Boolean(
			legacyAnswer || (savedAnswer && readWordOrder(savedAnswer.acceptedAnswer, sentenceCards)),
		);
	});
	const nextSentencePosition = solvedSentences.findIndex(isSolved => !isSolved);
	const sentencePosition = nextSentencePosition === -1 ? 0 : nextSentencePosition;
	const cards = getWordOrderCards(deck, sentencePosition);
	const solvedSentenceCount = solvedSentences.filter(isSolved => isSolved).length;
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
		sentencePosition,
	);
	const savedParagraphPositions =
		savedDraft ? readWordOrder(savedDraft.positions, paragraphCards) : null;
	const sentenceCardIds = new Set(cards.map(card => card.id));
	const savedPositions = savedParagraphPositions?.filter(position => sentenceCardIds.has(position));
	const positions = savedPositions ?? shuffleWordOrder(deck, sentencePosition);
	const attemptedPositions = savedAttempt ? readWordOrder(savedAttempt.answer, cards) : null;

	if (savedAttempt && attemptedPositions) {
		lastAttempt = {
			positions: attemptedPositions,
			inkSpent: savedAttempt.inkSpent,
			status: savedAttempt.status,
		};
	}

	const rewards = await getSolveRewards({
		database,
		userId,
		deckId,
		stage: 3,
	});

	return {
		...eligibility,
		rewards,
		deck,
		isUnlocked: isParagraphUnlocked,
		cards,
		positions,
		sentencePosition,
		sentenceCount: sentenceDefinitions.length,
		solvedSentenceCount,
		completedSolveStages,
		lastAttempt,
	};
}
