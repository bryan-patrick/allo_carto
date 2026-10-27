import type { SolveAttemptRequest, SolveAttemptResult } from '@/src/components/Solve/solveTypes';
import { inkConfig } from '@/src/util/ink';
import { checkSolveAnswer } from '@/src/util/solveAnswer';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolvePuzzle from './getSolvePuzzle';
import getUserInk from './getUserInk';

/**
 * Typing
 */
interface WriteSolveAttemptOptions extends SolveAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
}

interface SavedSolveAttempt extends SolveAttemptResult {
	deckId: string;
	position: number;
}

/**
 * Save the Ink charge, solved card, and receipt together.
 */
export default async function writeSolveAttempt({
	database,
	userId,
	deckId,
	position,
	answer,
	attemptId,
}: WriteSolveAttemptOptions): Promise<SolveAttemptResult> {
	const statements = {
		getReceipt: `
			SELECT deckId, position, status, acceptedAnswer, inkSpent
			FROM solveAttempts WHERE userId = ? AND attemptId = ?;
		`,
		spendInk: 'UPDATE userInk SET balance = ? WHERE userId = ? AND balance >= ?;',
		savePosition: `
			INSERT INTO solvePositions (userId, deckId, position, wordId, acceptedAnswer)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(userId, deckId, position)
			DO UPDATE SET wordId = excluded.wordId, acceptedAnswer = excluded.acceptedAnswer;
		`,
		saveReceipt: `
			INSERT INTO solveAttempts (
				userId, attemptId, deckId, position, status, acceptedAnswer, inkSpent
			) VALUES (?, ?, ?, ?, ?, ?, ?);
		`,
	};
	let result: SolveAttemptResult = { status: 'unavailable', acceptedAnswer: null, inkSpent: 0 };

	if (!attemptId) {
		throw new Error('A Solve attempt needs an ID before it can be saved.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const receipt = await transaction.getFirstAsync<SavedSolveAttempt>(
			statements.getReceipt,
			userId,
			attemptId,
		);

		if (receipt) {
			if (receipt.deckId !== deckId || receipt.position !== position) {
				throw new Error('This attempt was already used for another card.');
			}

			result = {
				status: receipt.status,
				acceptedAnswer: receipt.acceptedAnswer,
				inkSpent: receipt.inkSpent,
			};
			return;
		}

		const puzzle = await getSolvePuzzle({ database: transaction, userId, deckId });
		const card = puzzle.positions.find(card => card.position === position);

		if (!puzzle.isUnlocked || !puzzle.allWordsSeen) {
			return;
		}

		if (!card?.wordId) {
			throw new Error('Select a vocabulary card before submitting an answer.');
		}

		if (card.acceptedAnswer !== null) {
			result = { status: 'alreadySolved', acceptedAnswer: card.acceptedAnswer, inkSpent: 0 };
			return;
		}

		const checkedAnswer = checkSolveAnswer({ answer, englishWords: card.englishWords });
		const inkBalance = await getUserInk({ database: transaction, userId });
		const nextBalance = inkBalance - inkConfig.firstSolveAttempt;

		if (checkedAnswer.status === 'empty') {
			result = { ...checkedAnswer, inkSpent: 0 };
			return;
		}

		if (nextBalance < 0) {
			result = { status: 'notEnoughInk', acceptedAnswer: null, inkSpent: 0 };
			return;
		}

		const charge = await transaction.runAsync(
			statements.spendInk,
			nextBalance,
			userId,
			inkConfig.firstSolveAttempt,
		);

		if (charge.changes !== 1) {
			throw new Error('Could not save the Ink charge.');
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
		}

		await transaction.runAsync(
			statements.saveReceipt,
			userId,
			attemptId,
			deckId,
			position,
			checkedAnswer.status,
			checkedAnswer.acceptedAnswer,
			inkConfig.firstSolveAttempt,
		);

		result = { ...checkedAnswer, inkSpent: inkConfig.firstSolveAttempt };
	});

	return result;
}
