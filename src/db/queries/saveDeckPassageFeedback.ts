import type { DeckWordResultProps } from '@/src/components/CardDeck/deckSessionTypes';
import { getDB } from '../connection';

/**
 * Typing
 */
interface SaveDeckPassageFeedbackProps {
	userId: string;
	sessionId: string;
	deckId: string;
	isEasierToRead: boolean;
	results: DeckWordResultProps[];
}

/**
 * Creates a unique deck passage feedback entry
 */
export default async function saveDeckPassageFeedback({
	userId,
	sessionId,
	deckId,
	isEasierToRead,
	results,
}: SaveDeckPassageFeedbackProps): Promise<void> {
	const database = await getDB();
	const answeredAt = new Date().toISOString();
	let answer = 0;
	let correctCount = 0;
	let incorrectCount = 0;
	let skippedCount = 0;

	if (isEasierToRead) answer = 1;

	for (const result of results) {
		if (result.outcome === 'correct') correctCount += 1;
		else if (result.outcome === 'incorrect') incorrectCount += 1;
		else if (result.outcome === 'skipped') skippedCount += 1;
	}

	const saved = await database.runAsync(
		`
		INSERT INTO deckPassageFeedback (
			userId, sessionId, deckId, isEasierToRead,
			correctCount, incorrectCount, skippedCount, answeredAt
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(userId, sessionId) DO UPDATE SET
			isEasierToRead = excluded.isEasierToRead,
			correctCount = excluded.correctCount,
			incorrectCount = excluded.incorrectCount,
			skippedCount = excluded.skippedCount,
			answeredAt = excluded.answeredAt
		WHERE deckPassageFeedback.deckId = excluded.deckId;
		`,
		userId,
		sessionId,
		deckId,
		answer,
		correctCount,
		incorrectCount,
		skippedCount,
		answeredAt,
	);

	if (saved.changes !== 1) {
		throw new Error('Could not save passage feedback for this session.');
	}
}
