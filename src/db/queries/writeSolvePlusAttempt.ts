import type { SolveAttemptRequest, SolveAttemptResult } from '@/src/components/Solve/solveTypes';
import { checkFrenchSolveAnswer } from '@/src/util/solveAnswer';
import { solveStages } from '@/src/util/solveProgression';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolvePuzzle from './getSolvePuzzle';

/*
 * Typing
 */
interface WriteSolvePlusAttemptOptions extends SolveAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
	fastSolveUnlocks: boolean;
}

interface SavedSolvePlusAttempt {
	deckId: string;
	stage: number;
	position: number;
	answer: string | null;
	status: SolveAttemptResult['status'];
	acceptedAnswer: string | null;
	inkSpent: number;
	stageCompleted: number;
}

/*
 * Check a French answer and save its Ink charge, solved card, and second gem together.
 */
export default async function writeSolvePlusAttempt({
	database,
	userId,
	deckId,
	position,
	answer,
	attemptId,
	fastSolveUnlocks,
}: WriteSolvePlusAttemptOptions): Promise<SolveAttemptResult> {
	const statements = {
		getReceipt: `
			SELECT deckId, stage, position, answer, status, acceptedAnswer, inkSpent, stageCompleted
			FROM solveStageAttempts WHERE userId = ? AND attemptId = ?
			UNION ALL
			SELECT deckId, 1 AS stage, position, NULL AS answer, status,
				acceptedAnswer, inkSpent, 0 AS stageCompleted
			FROM solveAttempts WHERE userId = ? AND attemptId = ?;
		`,
		spendInk: `
			UPDATE userInk SET balance = balance - ?
			WHERE userId = ? AND balance >= ?;
		`,
		savePosition: `
			INSERT INTO solveStagePositions (userId, deckId, stage, position, wordId, acceptedAnswer)
			VALUES (?, ?, 2, ?, ?, ?)
			ON CONFLICT(userId, deckId, stage, position)
			DO UPDATE SET wordId = excluded.wordId, acceptedAnswer = excluded.acceptedAnswer;
		`,
		saveSecondGem: `
			UPDATE solveCompletions SET completedSolveStages = 2
			WHERE userId = ? AND deckId = ? AND completedSolveStages = 1;
		`,
		saveReceipt: `
			INSERT INTO solveStageAttempts (
				userId, attemptId, deckId, stage, position, answer,
				status, acceptedAnswer, inkSpent, stageCompleted
			) VALUES (?, ?, ?, 2, ?, ?, ?, ?, ?, ?);
		`,
	};
	let result: SolveAttemptResult = {
		status: 'unavailable',
		acceptedAnswer: null,
		inkSpent: 0,
		firstGemEarned: false,
		stageCompleted: false,
	};

	if (!attemptId) {
		throw new Error('A Solve+ attempt needs an ID before it can be saved.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const receipt = await transaction.getFirstAsync<SavedSolvePlusAttempt>(
			statements.getReceipt,
			userId,
			attemptId,
			userId,
			attemptId,
		);

		if (receipt) {
			if (
				receipt.stage !== 2 ||
				receipt.deckId !== deckId ||
				receipt.position !== position ||
				receipt.answer !== answer
			) {
				throw new Error('This attempt was already used for another answer.');
			}

			result = {
				status: receipt.status,
				acceptedAnswer: receipt.acceptedAnswer,
				inkSpent: receipt.inkSpent,
				firstGemEarned: false,
				stageCompleted: Boolean(receipt.stageCompleted),
			};
			return;
		}

		let stageCompleted = false;
		const puzzle = await getSolvePuzzle({
			database: transaction,
			userId,
			deckId,
			stage: 2,
			fastSolveUnlocks,
		});
		const card = puzzle.positions.find(card => card.position === position);
		const remainingCards = puzzle.positions.filter(card => {
			return card.wordId && card.position !== position && card.acceptedAnswer === null;
		});

		if (!puzzle.isUnlocked || !card?.wordId) {
			return;
		}

		if (card.acceptedAnswer !== null) {
			result.status = 'alreadySolved';
			result.acceptedAnswer = card.acceptedAnswer;
			return;
		}

		if (!puzzle.isEligible) {
			return;
		}

		const checkedAnswer = checkFrenchSolveAnswer({
			answer,
			frenchWords: card.frenchWords,
		});
		const cardCost = card.inkCost;
		const inkSpent =
			checkedAnswer.status === 'incorrect' ? solveStages[2].incorrectAttemptInkCost : cardCost;

		if (checkedAnswer.status === 'empty') {
			result.status = 'empty';
			return;
		}

		const charge = await transaction.runAsync(statements.spendInk, inkSpent, userId, cardCost);

		if (charge.changes !== 1) {
			result.status = 'notEnoughInk';
			return;
		}

		if (checkedAnswer.acceptedAnswer !== null) {
			await transaction.runAsync(
				statements.savePosition,
				userId,
				deckId,
				position,
				card.wordId,
				checkedAnswer.acceptedAnswer,
			);

			if (remainingCards.length === 0) {
				const completion = await transaction.runAsync(statements.saveSecondGem, userId, deckId);

				if (completion.changes !== 1) {
					throw new Error('Could not save the second gem.');
				}

				stageCompleted = true;
			}
		}

		await transaction.runAsync(
			statements.saveReceipt,
			userId,
			attemptId,
			deckId,
			position,
			answer,
			checkedAnswer.status,
			checkedAnswer.acceptedAnswer,
			inkSpent,
			stageCompleted ? 1 : 0,
		);

		result = {
			...checkedAnswer,
			inkSpent,
			firstGemEarned: false,
			stageCompleted,
		};
	});

	return result;
}
