import type {
	SolveAttemptResult,
	WordOrderAttemptRequest,
} from '@/src/components/Solve/solveTypes';
import { solveStages } from '@/src/util/solveProgression';
import { checkWordOrderAnswer, isCompleteWordOrder } from '@/src/util/solveWordOrder';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolveWordOrderPuzzle from './getSolveWordOrderPuzzle';
import { getSolveRewards, saveSolveGemReward } from './solveRewards';

/*
 * Typing
 */
interface WriteWordOrderAttemptOptions extends WordOrderAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
	fastSolveUnlocks: boolean;
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

/*
 * Save correct sentences and prepare the third gem after every sentence is solved.
 * Save each result and Ink charge together so retrying cannot charge the player twice.
 */
export default async function writeWordOrderAttempt({
	database,
	userId,
	deckId,
	position,
	positions,
	attemptId,
	fastSolveUnlocks,
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
		saveAnswer: `
			INSERT INTO solveStagePositions (userId, deckId, stage, position, acceptedAnswer)
			VALUES (?, ?, 3, ?, ?);
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

	await database.withExclusiveTransactionAsync(async transaction => {
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
			fastSolveUnlocks,
		});

		if (puzzle.completedSolveStages >= 3 || puzzle.rewards.some(reward => reward.kind === 'gem')) {
			result.status = 'alreadySolved';
			result.rewards = puzzle.rewards;
			return;
		}

		if (
			!puzzle.isEligible ||
			position !== puzzle.sentencePosition ||
			!isCompleteWordOrder(positions, puzzle.cards)
		) {
			return;
		}

		const isCorrect = checkWordOrderAnswer({
			deck: puzzle.deck,
			positions,
			sentencePosition: position,
		});
		const status = isCorrect ? 'exact' : 'incorrect';
		const acceptedAnswer = isCorrect ? answer : null;
		const charge = await transaction.runAsync(statements.spendInk, inkCost, userId, inkCost);

		if (charge.changes !== 1) {
			result.status = 'notEnoughInk';
			return;
		}

		if (isCorrect) {
			await transaction.runAsync(statements.saveAnswer, userId, deckId, position, answer);

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
