import { findParagraphById } from '@/src/util/atlasCompletion';
import {
	areLockedWordOrderCardsInPlace,
	getWordOrderCards,
	getWordOrderSentences,
	isCompleteWordOrder,
	readWordOrder,
	shuffleWordOrder,
} from '@/src/util/solveWordOrder';
import type { SQLiteDatabase } from 'expo-sqlite';
import { runDatabaseTransaction } from '../runDatabaseTransaction';

/**
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
	lockedCardIds: string;
}

/**
 * Save this Solve++ group's card order and keep the other groups' arrangements.
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
		INSERT INTO solveWordOrderDrafts (userId, deckId, positions, lockedCardIds)
		SELECT ?, ?, ?, ? WHERE EXISTS (
			SELECT 1 FROM solveCompletions
			WHERE userId = ? AND deckId = ? AND completedSolveStages = 2
		)
		ON CONFLICT(userId, deckId)
		DO UPDATE SET positions = excluded.positions, lockedCardIds = excluded.lockedCardIds;
	`;
	const deck = findParagraphById(deckId);
	const cards = deck ? getWordOrderCards(deck, position) : [];
	const getDraftStatement = `
		SELECT positions, lockedCardIds FROM solveWordOrderDrafts
		WHERE userId = ? AND deckId = ?;
	`;

	if (!deck || !isCompleteWordOrder(positions, cards)) {
		throw new Error('The arrangement must contain every card in this sentence once.');
	}

	await runDatabaseTransaction(database, async transaction => {
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
			getWordOrderSentences(deck).flatMap((_sentence, sentencePosition) => {
				return shuffleWordOrder(deck, sentencePosition);
			});
		const sentenceCardIds = new Set(cards.map(card => card.id));
		const previousSentencePositions = paragraphPositions.filter(cardId =>
			sentenceCardIds.has(cardId),
		);
		const otherSentencePositions = paragraphPositions.filter(
			cardId => !sentenceCardIds.has(cardId),
		);
		const nextPositions = [...otherSentencePositions, ...positions];
		const savedPositions = JSON.stringify(nextPositions);
		let paragraphLockedCardIds: number[] = [];
		let lockedCardIds: number[] = [];

		if (savedDraft && savedParagraphPositions) {
			paragraphLockedCardIds = JSON.parse(savedDraft.lockedCardIds);
			lockedCardIds = paragraphLockedCardIds.filter(cardId => sentenceCardIds.has(cardId));
		}

		if (!areLockedWordOrderCardsInPlace(previousSentencePositions, positions, lockedCardIds)) {
			throw new Error('Correctly placed words must stay in their saved slots.');
		}

		const saved = await transaction.runAsync(
			statement,
			userId,
			deckId,
			savedPositions,
			JSON.stringify(paragraphLockedCardIds),
			userId,
			deckId,
		);

		if (saved.changes !== 1) {
			throw new Error('The card order could not be saved for this unfinished Solve++ puzzle.');
		}
	});
}
