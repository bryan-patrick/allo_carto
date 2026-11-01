import type { SolveAttemptRequest, SolveAttemptResult } from '@/src/components/Solve/solveTypes';
import { inkConfig } from '@/src/util/ink';
import { checkSolveAnswer } from '@/src/util/solveAnswer';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolvePuzzle from './getSolvePuzzle';
import getUserInk from './getUserInk';
import { getSolveRewards, saveSolveCardReward, saveSolveGemReward } from './solveRewards';
import writeSolvePlusAttempt from './writeSolvePlusAttempt';

/*
 * Typing
 */
interface WriteSolveAttemptOptions extends SolveAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
	fastSolveUnlocks?: boolean;
}

interface SavedSolveAttempt extends Omit<SolveAttemptResult, 'firstGemEarned'> {
	deckId: string;
	position: number;
	firstGemEarned: number;
}

/*
 * Check an English answer and save the ink charge and card.
 */
export default async function writeSolveAttempt({
	database,
	userId,
	deckId,
	position,
	answer,
	attemptId,
	stage = 1,
	fastSolveUnlocks = true,
}: WriteSolveAttemptOptions): Promise<SolveAttemptResult> {
	const statements = {
		getReceipt: `
			SELECT deckId, position, status, acceptedAnswer, inkSpent, firstGemEarned
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
				userId, attemptId, deckId, position, status, acceptedAnswer, inkSpent, firstGemEarned
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
		`,
	};
	let result: SolveAttemptResult = {
		status: 'unavailable',
		acceptedAnswer: null,
		inkSpent: 0,
		firstGemEarned: false,
	};

	if (stage === 2) {
		return writeSolvePlusAttempt({
			database,
			userId,
			deckId,
			position,
			answer,
			attemptId,
			fastSolveUnlocks,
		});
	}

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

			const rewards = await getSolveRewards({
				database: transaction,
				userId,
				deckId,
				stage: 1,
			});

			result = {
				status: receipt.status,
				acceptedAnswer: receipt.acceptedAnswer,
				inkSpent: receipt.inkSpent,
				firstGemEarned: Boolean(receipt.firstGemEarned),
				rewards,
			};
			return;
		}

		const puzzle = await getSolvePuzzle({
			database: transaction,
			userId,
			deckId,
		});
		const card = puzzle.positions.find(card => card.position === position);
		const remainingCards = puzzle.positions.filter(card => {
			return card.wordId && card.position !== position && card.acceptedAnswer === null;
		});

		if (!puzzle.isUnlocked || !puzzle.allWordsSeen || !card?.wordId) {
			return;
		}

		if (card.acceptedAnswer !== null) {
			result.status = 'alreadySolved';
			result.acceptedAnswer = card.acceptedAnswer;
			result.rewards = puzzle.rewards;
			return;
		}

		const checkedAnswer = checkSolveAnswer({
			answer,
			englishWords: card.englishWords,
		});
		const cardCost = card.inkCost;
		const inkBalance = await getUserInk({
			database: transaction,
			userId,
		});
		const inkSpent =
			checkedAnswer.status === 'incorrect' ? inkConfig.incorrectSolveAttempt : cardCost;
		const nextBalance = inkBalance - inkSpent;

		if (checkedAnswer.status === 'empty') {
			result.status = 'empty';
			return;
		}

		/*
		 * Wrong answers don't cost as much ink as correct ones
		 */
		if (inkBalance < cardCost) {
			result.status = 'notEnoughInk';
			return;
		}

		const charge = await transaction.runAsync(statements.spendInk, nextBalance, userId, cardCost);

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

			await saveSolveCardReward({
				database: transaction,
				userId,
				deckId,
				stage: 1,
				position,
				wordId: card.wordId,
			});

			// Keep the gem hidden until the player claims it after the last card.
			if (remainingCards.length === 0 && !puzzle.hasFirstGem) {
				await saveSolveGemReward({
					database: transaction,
					userId,
					deckId,
					stage: 1,
				});
			}
		}

		await transaction.runAsync(
			statements.saveReceipt,
			userId,
			attemptId,
			deckId,
			position,
			checkedAnswer.status,
			checkedAnswer.acceptedAnswer,
			inkSpent,
			0,
		);

		const rewards = await getSolveRewards({
			database: transaction,
			userId,
			deckId,
			stage: 1,
		});

		result = {
			...checkedAnswer,
			inkSpent,
			firstGemEarned: false,
			rewards,
		};
	});

	return result;
}
