import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	SavedWordOrderAttempt,
	SolveReward,
	SolveStageSolvedPosition,
	SolveWordOrderCard,
	SolveWordOrderPuzzle,
} from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getCompletedSolveStages, getSolveStageEligibility } from '@/src/util/solveProgression';
import {
	getWordOrderCards,
	getWordOrderCardsFromSegments,
	getWordOrderSentences,
	readWordOrder,
	shuffleWordOrder,
	type WordOrderSentence,
} from '@/src/util/solveWordOrder';
import { splitFrenchSentences, type SentencePassage } from '@/src/util/splitFrenchSentences';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolveStageProgress from './getSolveStageProgress';
import loadUserXP from './getUserExperience';
import getUserProgress from './getUserProgress';
import { getSolveRewards } from './solveRewards';

/**
 * Types
 */
interface GetSolveWordOrderPuzzleOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	fastSolveUnlocks: boolean;
	sentencePosition?: number;
}

interface WordOrderDraftRow {
	positions: string;
	lockedCardIds: string;
}

interface WordOrderAttemptRow {
	answer: string;
	inkSpent: number;
	status: 'exact' | 'incorrect';
}

interface GetSolvedSentenceGroupsOptions {
	paragraph: Paragraph;
	paragraphCards: SolveWordOrderCard[];
	sentenceGroups: WordOrderSentence[];
	savedAnswers: SolveStageSolvedPosition[];
}

interface GetOriginalSentencesSolvedOptions {
	sentenceGroup: WordOrderSentence;
	originalSentences: SentencePassage[];
	savedAnswers: SolveStageSolvedPosition[];
}

interface GetSentencePositionToOpenOptions {
	sentenceGroups: WordOrderSentence[];
	solvedSentenceGroups: boolean[];
	puzzleRewards: SolveReward[];
	requestedSentencePosition?: number;
}

/**
 * Puzzle stage and database statements
 */
const wordOrderPuzzleStage = 3;
const getWordOrderDraftStatement = `
	SELECT positions, lockedCardIds
	FROM solveWordOrderDrafts
	WHERE userId = ? AND deckId = ?;
`;
const getWordOrderAttemptsStatement = `
	SELECT answer, inkSpent, status
	FROM solveStageAttempts
	WHERE userId = ? AND deckId = ? AND stage = ${wordOrderPuzzleStage}
		AND position IN (?, ?)
	ORDER BY rowid DESC;
`;

/**
 * Check whether an older save already solved every sentence in this group.
 */
function areOriginalSentencesSolved({
	sentenceGroup,
	originalSentences,
	savedAnswers,
}: GetOriginalSentencesSolvedOptions): boolean {
	let areAllOriginalSentencesSolved = true;

	for (const originalSentencePosition of sentenceGroup.originalSentencePositions) {
		const originalSentence = originalSentences[originalSentencePosition];
		const originalSentenceCards = getWordOrderCardsFromSegments(originalSentence.segments);

		const savedOriginalAnswer = savedAnswers.find(savedAnswer => {
			return savedAnswer.position === originalSentencePosition;
		});

		let savedOriginalCardOrder: number[] | null = null;

		if (savedOriginalAnswer) {
			savedOriginalCardOrder = readWordOrder(
				savedOriginalAnswer.acceptedAnswer,
				originalSentenceCards,
			);
		}

		if (savedOriginalCardOrder === null) {
			areAllOriginalSentencesSolved = false;
			break;
		}
	}

	return areAllOriginalSentencesSolved;
}

/**
 * List which sentence groups the player has already solve
 */
function getSolvedSentenceGroups({
	paragraph,
	paragraphCards,
	sentenceGroups,
	savedAnswers,
}: GetSolvedSentenceGroupsOptions): boolean[] {
	/**
	 * Original sentences and older paragraph answers
	 */
	const originalSentences = splitFrenchSentences(paragraph);
	const savedParagraphAnswer = savedAnswers.find(savedAnswer => {
		return (
			savedAnswer.position === 0 &&
			readWordOrder(savedAnswer.acceptedAnswer, paragraphCards) !== null
		);
	});
	const solvedSentenceGroups: boolean[] = [];

	for (const [sentenceGroupPosition, sentenceGroup] of sentenceGroups.entries()) {
		/**
		 * Cards and saved answer for this group
		 */
		const firstOriginalSentencePosition = sentenceGroup.originalSentencePositions[0];

		const savedSentenceAnswer = savedAnswers.find(savedAnswer => {
			return savedAnswer.position === firstOriginalSentencePosition;
		});

		const sentenceCards = getWordOrderCards(paragraph, sentenceGroupPosition);
		let savedSentenceCardOrder: number[] | null = null;
		let isSentenceGroupSolved = false;

		if (savedSentenceAnswer) {
			savedSentenceCardOrder = readWordOrder(savedSentenceAnswer.acceptedAnswer, sentenceCards);
		}

		if (savedParagraphAnswer || savedSentenceCardOrder) {
			isSentenceGroupSolved = true;
		} else {
			isSentenceGroupSolved = areOriginalSentencesSolved({
				sentenceGroup,
				originalSentences,
				savedAnswers,
			});
		}

		solvedSentenceGroups.push(isSentenceGroupSolved);
	}

	return solvedSentenceGroups;
}

/**
 * Choose which sentence to open
 */
function getSentencePositionToOpen({
	sentenceGroups,
	solvedSentenceGroups,
	puzzleRewards,
	requestedSentencePosition,
}: GetSentencePositionToOpenOptions): number {
	const nextUnsolvedSentencePosition = solvedSentenceGroups.findIndex(isSolved => !isSolved);
	const unclaimedWordPositions = new Set<number>();
	let sentenceWithUnclaimedXPPosition = -1;
	let sentencePositionToOpen = 0;

	for (const reward of puzzleRewards) {
		if (reward.kind === 'card' && reward.claimedAt === null) {
			unclaimedWordPositions.add(reward.position);
		}
	}

	for (const [sentencePosition, sentenceGroup] of sentenceGroups.entries()) {
		const hasUnclaimedWordXP = sentenceGroup.segments.some(segment => {
			return unclaimedWordPositions.has(segment.position);
		});

		if (hasUnclaimedWordXP) {
			sentenceWithUnclaimedXPPosition = sentencePosition;
			break;
		}
	}

	if (nextUnsolvedSentencePosition !== -1) {
		sentencePositionToOpen = nextUnsolvedSentencePosition;
	}

	if (sentenceWithUnclaimedXPPosition !== -1) {
		sentencePositionToOpen = sentenceWithUnclaimedXPPosition;
	}

	/**
	 * Use the requested sentence when if belongs to this paragraph.
	 */
	if (requestedSentencePosition !== undefined && sentenceGroups[requestedSentencePosition]) {
		sentencePositionToOpen = requestedSentencePosition;
	}

	return sentencePositionToOpen;
}

/**
 * Find the player's latest saved attempt
 */
function getLastWordOrderAttempt(
	savedAttemptRows: WordOrderAttemptRow[],
	sentenceCards: SolveWordOrderCard[],
): SavedWordOrderAttempt | null {
	let lastWordOrderAttempt: SavedWordOrderAttempt | null = null;

	for (const savedAttempt of savedAttemptRows) {
		const attemptedCardOrder = readWordOrder(savedAttempt.answer, sentenceCards);

		if (attemptedCardOrder !== null) {
			lastWordOrderAttempt = {
				positions: attemptedCardOrder,
				inkSpent: savedAttempt.inkSpent,
				status: savedAttempt.status,
			};
			break;
		}
	}

	return lastWordOrderAttempt;
}

/**
 * Load the puzzle
 */
export default async function getSolveWordOrderPuzzle({
	database,
	userId,
	deckId,
	fastSolveUnlocks,
	sentencePosition: requestedSentencePosition,
}: GetSolveWordOrderPuzzleOptions): Promise<SolveWordOrderPuzzle> {
	/**
	 * Paragraph content
	 */
	const paragraph = findParagraphById(deckId);

	if (!paragraph) {
		throw new Error('This paragraph could not be found.');
	}

	const paragraphCards = getWordOrderCards(paragraph);
	const sentenceGroups = getWordOrderSentences(paragraph);

	if (sentenceGroups.length === 0) {
		throw new Error('This paragraph has no sentences to solve.');
	}

	/**
	 * Saved answers and rewards
	 */
	const savedPuzzleProgress = await getSolveStageProgress({
		database,
		userId,
		deckId,
		stage: wordOrderPuzzleStage,
	});

	const puzzleRewards = await getSolveRewards({
		database,
		userId,
		deckId,
		stage: wordOrderPuzzleStage,
	});

	const solvedSentenceGroups = getSolvedSentenceGroups({
		paragraph,
		paragraphCards,
		sentenceGroups,
		savedAnswers: savedPuzzleProgress.solvedPositions,
	});

	/**
	 * Selected sentence group
	 */
	const selectedSentencePosition = getSentencePositionToOpen({
		sentenceGroups,
		solvedSentenceGroups,
		puzzleRewards,
		requestedSentencePosition,
	});

	const selectedSentenceGroup = sentenceGroups[selectedSentencePosition];
	const firstOriginalSentencePosition = selectedSentenceGroup.originalSentencePositions[0];
	const sentenceCards = getWordOrderCards(paragraph, selectedSentencePosition);
	const sentenceCardIds = new Set(sentenceCards.map(card => card.id));
	const isSelectedSentenceSolved = solvedSentenceGroups[selectedSentencePosition];

	const savedSentenceAnswer = savedPuzzleProgress.solvedPositions.find(savedAnswer => {
		return savedAnswer.position === firstOriginalSentencePosition;
	});

	const solvedSentenceCount = solvedSentenceGroups.filter(isSolved => isSolved).length;

	/**
	 * Player progress and puzzle access
	 */
	const playerProgressById = await getUserProgress({
		database,
		userId,
	});

	const playerExperience = await loadUserXP({
		database,
		userId,
	});

	const paragraphProgress = playerProgressById[deckId];
	const completedSolveStages = getCompletedSolveStages(paragraphProgress);

	const isParagraphUnlocked = isItemUnlocked({
		id: deckId,
		progressById: playerProgressById,
	});

	const puzzleEligibility = getSolveStageEligibility({
		stage: wordOrderPuzzleStage,
		completedStages: completedSolveStages,
		playerLevel: playerExperience.level,
		fastSolveUnlocks,
		isParagraphUnlocked,
		wordCount: paragraph.wordIds.length,
		seenWordCount: paragraphProgress?.seenWordCount ?? 0,
	});

	/**
	 * Saved card order and attempts
	 */
	const savedDraft = await database.getFirstAsync<WordOrderDraftRow>(
		getWordOrderDraftStatement,
		userId,
		deckId,
	);
	const savedAttemptRows = await database.getAllAsync<WordOrderAttemptRow>(
		getWordOrderAttemptsStatement,
		userId,
		deckId,
		selectedSentencePosition,
		firstOriginalSentencePosition,
	);
	const savedLockedCardIds: number[] = JSON.parse(savedDraft?.lockedCardIds ?? '[]');
	let savedParagraphCardOrder: number[] | null = null;
	let savedSentenceCardOrder: number[] | null = null;

	/**
	 * Puzzle result
	 */
	const puzzleResult: SolveWordOrderPuzzle = {
		...puzzleEligibility,
		rewards: puzzleRewards,
		deck: paragraph,
		isUnlocked: isParagraphUnlocked,
		cards: sentenceCards,
		positions: [],
		lockedCardIds: [],
		sentencePosition: selectedSentencePosition,
		isSentenceSolved: isSelectedSentenceSolved,
		sentenceCount: sentenceGroups.length,
		solvedSentenceCount,
		completedSolveStages,
		lastAttempt: getLastWordOrderAttempt(savedAttemptRows, sentenceCards),
	};

	/**
	 * Resume the attempt
	 */
	if (savedDraft) {
		savedParagraphCardOrder = readWordOrder(savedDraft.positions, paragraphCards);
	}

	if (savedParagraphCardOrder !== null) {
		puzzleResult.positions = savedParagraphCardOrder.filter(cardId => sentenceCardIds.has(cardId));
		puzzleResult.lockedCardIds = savedLockedCardIds.filter(cardId => sentenceCardIds.has(cardId));
	} else {
		puzzleResult.positions = shuffleWordOrder(paragraph, selectedSentencePosition);
	}

	/**
	 * Keep solved cards in order
	 */
	if (isSelectedSentenceSolved && savedSentenceAnswer) {
		savedSentenceCardOrder = readWordOrder(savedSentenceAnswer.acceptedAnswer, sentenceCards);
	}

	if (isSelectedSentenceSolved) {
		puzzleResult.positions = sentenceCards.map(card => card.id);
	}

	if (savedSentenceCardOrder !== null) {
		puzzleResult.positions = savedSentenceCardOrder;
	}

	return puzzleResult;
}
