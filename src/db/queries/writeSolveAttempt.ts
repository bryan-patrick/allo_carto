import type { SolveAttemptRequest, SolveAttemptResult } from '@/src/components/Solve/solveTypes';
import { inkConfig } from '@/src/util/ink';
import { checkSolveAnswer } from '@/src/util/solveAnswer';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolvePuzzle from './getSolvePuzzle';
import getUserInk from './getUserInk';

interface WriteSolveAttemptOptions extends SolveAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
}

interface SavedSolveAttempt extends Omit<SolveAttemptResult, 'firstGemEarned'> {
	deckId: string;
	position: number;
	firstGemEarned: number;
}

/**
 * We save the answer and its Ink charge together so neither can be saved alone.
 * Retrying the same answer uses its saved receipt without charging again.
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
		saveFirstGem: `
			INSERT INTO solveCompletions (userId, deckId, completedAt)
			VALUES (?, ?, ?)
			ON CONFLICT(userId, deckId) DO NOTHING;
		`,
	};
	let result: SolveAttemptResult = {
		status: 'unavailable',
		acceptedAnswer: null,
		inkSpent: 0,
		firstGemEarned: false,
	};

	if (!attemptId) {
		throw new Error('A Solve attempt needs an ID before it can be saved.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const receipt = await transaction.getFirstAsync<SavedSolveAttempt>(
			statements.getReceipt,
			userId,
			attemptId,
		);
		let firstGemEarned = false;

		if (receipt) {
			if (receipt.deckId !== deckId || receipt.position !== position) {
				throw new Error('This attempt was already used for another card.');
			}

			result = {
				status: receipt.status,
				acceptedAnswer: receipt.acceptedAnswer,
				inkSpent: receipt.inkSpent,
				firstGemEarned: Boolean(receipt.firstGemEarned),
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
			return;
		}

		if (!card.isUnlocked) {
			result.status = 'locked';
			return;
		}

		const checkedAnswer = checkSolveAnswer({
			answer,
			englishWords: card.englishWords,
		});
		const cardCost = inkConfig.cardCostByRarity[card.rarity];
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

		/**
		 * The player needs enough Ink for a correct answer before trying.
		 * Takes the smaller price if their answer is wrong.
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

			/**
			 * The last correct card earns the first gem in this same save.
			 * Story access follows that saved gem, so a failed save cannot open the next paragraph.
			 */
			if (remainingCards.length === 0 && !puzzle.hasFirstGem) {
				const completion = await transaction.runAsync(
					statements.saveFirstGem,
					userId,
					deckId,
					Date.now(),
				);

				firstGemEarned = completion.changes === 1;
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
			firstGemEarned ? 1 : 0,
		);

		result = {
			...checkedAnswer,
			inkSpent,
			firstGemEarned,
		};
	});

	return result;
}
