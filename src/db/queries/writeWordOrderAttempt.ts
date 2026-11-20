import type {
	SolveAttemptResult,
	WordOrderAttemptRequest,
} from '@/src/components/Solve/solveTypes';
import { solveStages } from '@/src/util/solveProgression';
import {
	areLockedWordOrderCardsInPlace,
	getCorrectWordOrderCardIds,
	getWordOrderCards,
	getWordOrderSentences,
	isCompleteWordOrder,
	readWordOrder,
} from '@/src/util/solveWordOrder';
import type { SQLiteDatabase } from 'expo-sqlite';
import { runDatabaseTransaction } from '../runDatabaseTransaction';
import getSolveWordOrderPuzzle from './getSolveWordOrderPuzzle';
import { getSolveRewards, saveSolveCardReward, saveSolveGemReward } from './solveRewards';

/**
 * Typing
 */
interface WriteWordOrderAttemptOptions extends WordOrderAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
}

interface WordOrderReceiptRow {
	deckId: string;
	stage: number;
	position: number;
	answer: string | null;
	status: SolveAttemptResult['status'];
	inkSpent: number;
	stageCompleted: number;
}

interface WordOrderDraftRow {
	positions: string;
	lockedCardIds: string;
}

/**
 * Check each card's position
 */
export default async function writeWordOrderAttempt({
	database,
	userId,
	deckId,
	position,
	positions,
	attemptId,
}: WriteWordOrderAttemptOptions): Promise<SolveAttemptResult> {
	const statements = {
		getReceipt: `
			SELECT deckId, stage, position, answer, status, inkSpent, stageCompleted
			FROM solveStageAttempts WHERE userId = ? AND attemptId = ?
			UNION ALL
			SELECT deckId, 1 AS stage, position, NULL AS answer, status, inkSpent, 0 AS stageCompleted
			FROM solveAttempts WHERE userId = ? AND attemptId = ?;
		`,
		spendInk: `
			UPDATE userInk SET balance = balance - ?
			WHERE userId = ? AND balance >= ?;
		`,
		getDraft: `
			SELECT positions, lockedCardIds FROM solveWordOrderDrafts
			WHERE userId = ? AND deckId = ?;
		`,
		saveDraft: `
			INSERT INTO solveWordOrderDrafts (userId, deckId, positions, lockedCardIds)
			VALUES (?, ?, ?, ?)
			ON CONFLICT(userId, deckId)
			DO UPDATE SET positions = excluded.positions, lockedCardIds = excluded.lockedCardIds;
		`,
		saveAnswer: `
			INSERT INTO solveStagePositions (userId, deckId, stage, position, acceptedAnswer)
			VALUES (?, ?, 3, ?, ?)
			ON CONFLICT(userId, deckId, stage, position)
			DO UPDATE SET acceptedAnswer = excluded.acceptedAnswer;
		`,
		saveReceipt: `
			INSERT INTO solveStageAttempts (
				userId, attemptId, deckId, stage, position, answer,
				status, acceptedAnswer, inkSpent, stageCompleted
			) VALUES (?, ?, ?, 3, ?, ?, ?, ?, ?, ?);
		`,
		clearDraft: 'DELETE FROM solveWordOrderDrafts WHERE userId = ? AND deckId = ?;',
	};

	const answer = JSON.stringify(positions);
	const inkCost = solveStages[3].attemptInkCost;

	let result: SolveAttemptResult = {
		status: 'unavailable',
		acceptedAnswer: null,
		inkSpent: 0,
		firstGemEarned: false,
		stageCompleted: false,
	};

	if (!attemptId || inkCost === null) {
		throw new Error('The Solve++ submission needs an ID and an Ink price.');
	}

	await runDatabaseTransaction(database, async transaction => {
		const receipt = await transaction.getFirstAsync<WordOrderReceiptRow>(
			statements.getReceipt,
			userId,
			attemptId,
			userId,
			attemptId,
		);

		if (receipt) {
			if (
				receipt.stage !== 3 ||
				receipt.deckId !== deckId ||
				receipt.position !== position ||
				receipt.answer !== answer
			) {
				throw new Error('This submission ID was already used for another answer.');
			}

			const rewards = await getSolveRewards({
				database: transaction,
				userId,
				deckId,
				stage: 3,
			});

			result = {
				status: receipt.status,
				acceptedAnswer: null,
				inkSpent: receipt.inkSpent,
				firstGemEarned: false,
				stageCompleted: Boolean(receipt.stageCompleted),
				rewards,
			};
			return;
		}

		const puzzle = await getSolveWordOrderPuzzle({
			database: transaction,
			userId,
			deckId,
		});

		if (
			puzzle.isSentenceSolved ||
			puzzle.completedSolveStages >= 3 ||
			puzzle.rewards.some(reward => reward.kind === 'gem')
		) {
			result.status = 'alreadySolved';
			result.rewards = puzzle.rewards;
			return;
		}

		if (
			!puzzle.isEligible ||
			position !== puzzle.sentencePosition ||
			!isCompleteWordOrder(positions, puzzle.cards) ||
			!areLockedWordOrderCardsInPlace(puzzle.positions, positions, puzzle.lockedCardIds)
		) {
			return;
		}

		const correctCardIds = getCorrectWordOrderCardIds({
			deck: puzzle.deck,
			positions,
			sentencePosition: position,
			lockedCardIds: puzzle.lockedCardIds,
		});

		const isCorrect = correctCardIds.length === puzzle.cards.length;
		const sentenceDefinition = getWordOrderSentences(puzzle.deck)[position];
		const originalSentencePosition = sentenceDefinition.originalSentencePositions[0];

		const savedDraft = await transaction.getFirstAsync<WordOrderDraftRow>(
			statements.getDraft,
			userId,
			deckId,
		);

		const paragraphCards = getWordOrderCards(puzzle.deck);
		const sentenceCardIds = new Set(puzzle.cards.map(card => card.id));

		let paragraphPositions = paragraphCards.map(card => card.id);
		let lockedCardIds: number[] = [];
		let status: SolveAttemptResult['status'] = 'incorrect';
		let acceptedAnswer: string | null = null;

		if (savedDraft) {
			const savedParagraphPositions = readWordOrder(savedDraft.positions, paragraphCards);

			if (savedParagraphPositions) {
				paragraphPositions = savedParagraphPositions;
				lockedCardIds = JSON.parse(savedDraft.lockedCardIds);
			}
		}

		if (isCorrect) {
			status = 'exact';
			acceptedAnswer = answer;
		}

		const otherSentencePositions = paragraphPositions.filter(
			cardId => !sentenceCardIds.has(cardId),
		);

		const nextParagraphPositions = [...otherSentencePositions, ...positions];
		const nextLockedCardIds = Array.from(new Set([...lockedCardIds, ...correctCardIds]));
		const charge = await transaction.runAsync(statements.spendInk, inkCost, userId, inkCost);

		if (charge.changes !== 1) {
			result.status = 'notEnoughInk';
			return;
		}

		/**
		 * Save the submitted order and every correct position
		 */
		await transaction.runAsync(
			statements.saveDraft,
			userId,
			deckId,
			JSON.stringify(nextParagraphPositions),
			JSON.stringify(nextLockedCardIds),
		);

		/**
		 * A correctly placed word can be claimed
		 */
		for (const cardId of correctCardIds) {
			const segment = sentenceDefinition.segments.find(segment => segment.position === cardId);

			if (segment?.wordId && !segment.unlockExempt) {
				await saveSolveCardReward({
					database: transaction,
					userId,
					deckId,
					stage: 3,
					position: cardId,
					wordId: segment.wordId,
				});
			}
		}

		if (isCorrect) {
			/**
			 * Keep the group's first original sentence number as its saved key
			 */
			await transaction.runAsync(
				statements.saveAnswer,
				userId,
				deckId,
				originalSentencePosition,
				answer,
			);

			if (puzzle.solvedSentenceCount + 1 === puzzle.sentenceCount) {
				await saveSolveGemReward({
					database: transaction,
					userId,
					deckId,
					stage: 3,
				});

				await transaction.runAsync(statements.clearDraft, userId, deckId);
			}
		}

		await transaction.runAsync(
			statements.saveReceipt,
			userId,
			attemptId,
			deckId,
			position,
			answer,
			status,
			acceptedAnswer,
			inkCost,
			0,
		);

		const rewards = await getSolveRewards({
			database: transaction,
			userId,
			deckId,
			stage: 3,
		});

		result = {
			status,
			acceptedAnswer: null,
			inkSpent: inkCost,
			firstGemEarned: false,
			stageCompleted: false,
			rewards,
		};
	});

	return result;
}
