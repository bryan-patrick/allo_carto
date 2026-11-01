import { findParagraphById } from '@/src/util/atlasCompletion';
import {
	getWordOrderCards,
	isCompleteWordOrder,
	readWordOrder,
	shuffleWordOrder,
} from '@/src/util/solveWordOrder';
import { splitFrenchSentences } from '@/src/util/splitFrenchSentences';
import type { SQLiteDatabase } from 'expo-sqlite';

/*
 * Typing
 */
interface SaveWordOrderDraftOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	position: number;
	positions: number[];
}

interface WordOrderDraftRow {
	positions: string;
}

/*
 * Saves this sentence's card order and keeps the other sentences' arrangements.
 * This lets the player leave Solve++ and resume later.
 */
export default async function saveWordOrderDraft({
	database,
	userId,
	deckId,
	position,
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
	const cards = deck ? getWordOrderCards(deck, position) : [];
	const getDraftStatement = `
		SELECT positions FROM solveWordOrderDrafts
		WHERE userId = ? AND deckId = ?;
	`;

	if (!deck || !isCompleteWordOrder(positions, cards)) {
		throw new Error('The arrangement must contain every card in this sentence once.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const savedDraft = await transaction.getFirstAsync<WordOrderDraftRow>(
			getDraftStatement,
			userId,
			deckId,
		);
		const paragraphCards = getWordOrderCards(deck);
		const savedParagraphPositions =
			savedDraft ? readWordOrder(savedDraft.positions, paragraphCards) : null;
		const paragraphPositions =
			savedParagraphPositions ??
			splitFrenchSentences(deck).flatMap((_sentence, sentencePosition) => {
				return shuffleWordOrder(deck, sentencePosition);
			});
		const sentenceCardIds = new Set(cards.map(card => card.id));
		const otherSentencePositions = paragraphPositions.filter(
			cardId => !sentenceCardIds.has(cardId),
		);
		const nextPositions = [...otherSentencePositions, ...positions];
		const savedPositions = JSON.stringify(nextPositions);
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
