import { findParagraphById } from '@/src/util/atlasCompletion';
import { getWordOrderCards, isCompleteWordOrder } from '@/src/util/solveWordOrder';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Typing
 */
interface SaveWordOrderDraftOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	positions: number[];
}

/**
 * Saves the current card order so the player can leave Solve++ and resume later.
 */
export default async function saveWordOrderDraft({
	database,
	userId,
	deckId,
	positions,
}: SaveWordOrderDraftOptions): Promise<void> {
	const statement = `
		INSERT INTO solveWordOrderDrafts (userId, deckId, positions)
		SELECT ?, ?, ? WHERE EXISTS (
			SELECT 1 FROM solveCompletions
			WHERE userId = ? AND deckId = ? AND completedSolveStages = 2
		)
		ON CONFLICT(userId, deckId) DO UPDATE SET positions = excluded.positions;
	`;
	const deck = findParagraphById(deckId);
	const cards = deck ? getWordOrderCards(deck) : [];
	const savedPositions = JSON.stringify(positions);

	if (!isCompleteWordOrder(positions, cards)) {
		throw new Error('The arrangement must contain every card once.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const saved = await transaction.runAsync(
			statement,
			userId,
			deckId,
			savedPositions,
			userId,
			deckId,
		);

		if (saved.changes !== 1) {
			throw new Error('The card order could not be saved for this unfinished Solve++ puzzle.');
		}
	});
}
