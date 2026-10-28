import type { SolveAttemptResult, SolveCardRequest } from '@/src/components/Solve/solveTypes';
import { getSolveCardInkCost } from '@/src/util/solveProgression';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolvePuzzle from './getSolvePuzzle';
import getUserInk from './getUserInk';

interface UnlockSolveCardOptions extends SolveCardRequest {
	database: SQLiteDatabase;
	userId: string;
	fastSolveUnlocks?: boolean;
}

/**
 * We use this to spend Ink and reveal a card's prompt in Solve or Solve+.
 * Each puzzle saves its own unlocks, so opening a Solve card does not open its Solve+ card.
 */
export default async function unlockSolveCard({
	database,
	userId,
	deckId,
	position,
	stage = 1,
	fastSolveUnlocks = true,
}: UnlockSolveCardOptions): Promise<SolveAttemptResult> {
	const statements = {
		spendInk: 'UPDATE userInk SET balance = ? WHERE userId = ? AND balance >= ?;',
		saveUnlock:
			stage === 2 ?
				`
			INSERT INTO solveStageUnlocks (userId, deckId, stage, position, wordId)
			VALUES (?, ?, 2, ?, ?)
			ON CONFLICT(userId, deckId, stage, position)
			DO UPDATE SET wordId = excluded.wordId;
		`
			:	`
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
		firstGemEarned: false,
	};

	await database.withExclusiveTransactionAsync(async transaction => {
		const puzzle = await getSolvePuzzle({
			database: transaction,
			userId,
			deckId,
			stage,
			fastSolveUnlocks,
		});
		const card = puzzle.positions.find(card => card.position === position);
		const canUnlock = stage === 1 ? puzzle.allWordsSeen : puzzle.isEligible;
		let inkBalance: number;
		let cardCost: number;

		if (!puzzle.isUnlocked || !canUnlock || !card?.wordId) {
			return;
		}

		if (card.isUnlocked) {
			result.status = 'alreadyUnlocked';
			return;
		}

		cardCost = getSolveCardInkCost(stage, card.rarity);
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
