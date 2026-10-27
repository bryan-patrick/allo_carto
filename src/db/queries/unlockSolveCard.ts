import type { SolveAttemptResult, SolveCardRequest } from '@/src/components/Solve/solveTypes';
import { inkConfig } from '@/src/util/ink';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolvePuzzle from './getSolvePuzzle';
import getUserInk from './getUserInk';

interface UnlockSolveCardOptions extends SolveCardRequest {
	database: SQLiteDatabase;
	userId: string;
}

/**
 * Saves the unlock and its ink cost.
 */
export default async function unlockSolveCard({
	database,
	userId,
	deckId,
	position,
}: UnlockSolveCardOptions): Promise<SolveAttemptResult> {
	const statements = {
		spendInk: 'UPDATE userInk SET balance = ? WHERE userId = ? AND balance >= ?;',
		saveUnlock: `
			INSERT INTO solveUnlocks (userId, deckId, position, wordId)
			VALUES (?, ?, ?, ?)
			ON CONFLICT(userId, deckId, position)
			DO UPDATE SET wordId = excluded.wordId;
		`,
	};
	let result: SolveAttemptResult = {
		status: 'unavailable',
		acceptedAnswer: null,
		inkSpent: 0,
	};

	await database.withExclusiveTransactionAsync(async transaction => {
		const puzzle = await getSolvePuzzle({
			database: transaction,
			userId,
			deckId,
		});
		const card = puzzle.positions.find(card => card.position === position);
		let inkBalance: number;
		let cardCost: number;

		if (!puzzle.isUnlocked || !puzzle.allWordsSeen || !card?.wordId) {
			return;
		}

		if (card.isUnlocked) {
			result.status = 'alreadyUnlocked';
			return;
		}

		cardCost = inkConfig.cardCostByRarity[card.rarity];
		inkBalance = await getUserInk({
			database: transaction,
			userId,
		});

		if (inkBalance < cardCost) {
			result.status = 'notEnoughInk';
			return;
		}

		const nextBalance = inkBalance - cardCost;
		const charge = await transaction.runAsync(statements.spendInk, nextBalance, userId, cardCost);

		if (charge.changes !== 1) {
			throw new Error('Could not save the Ink charge.');
		}

		await transaction.runAsync(statements.saveUnlock, userId, deckId, position, card.wordId);

		result.status = 'unlocked';
		result.inkSpent = cardCost;
	});

	return result;
}
