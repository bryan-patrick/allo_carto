import type {
	DeckSessionProps,
	DeckWordResultProps,
} from '@/src/components/CardDeck/deckSessionTypes';
import { createDeckSession } from '@/src/util/createDeckSession';
import { createFlashcardDecks } from '@/src/util/createFlashcardDecks';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Typing
 */
interface FlashcardCycleOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	wordIds: string[];
	unseenWordIds: string[];
	targetCardsPerDeck: number;
}

interface FlashcardCycleRow {
	cycleId: string;
	decks: string;
	deckIndex: number;
	sessionId: string;
	xpBefore: number;
	unseenWordIds: string;
	results: string;
}

interface UserXPRow {
	totalXP: number;
}

export interface FlashcardCycle {
	id: string;
	decks: string[][];
	deckIndex: number;
	session: DeckSessionProps;
}

interface SaveFlashcardResultOptions {
	database: SQLiteDatabase;
	userId: string;
	sessionId: string;
	result: DeckWordResultProps;
}

interface FinishFlashcardDeckOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	sessionId: string;
}

const statements = {
	getCycle: `
		SELECT cycleId, decks, deckIndex, sessionId, xpBefore, unseenWordIds, results
		FROM flashcardCycles WHERE userId = ? AND deckId = ?;
	`,
	getSession: `
		SELECT cycleId, decks, deckIndex, sessionId, xpBefore, unseenWordIds, results
		FROM flashcardCycles WHERE userId = ? AND sessionId = ?;
	`,
	getUserXP: 'SELECT totalXP FROM users WHERE id = ?;',
	saveCycle: `
		INSERT INTO flashcardCycles (
			userId, deckId, cycleId, decks, deckIndex, sessionId, xpBefore, unseenWordIds, results
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(userId, deckId) DO UPDATE SET
			cycleId = excluded.cycleId,
			decks = excluded.decks,
			deckIndex = excluded.deckIndex,
			sessionId = excluded.sessionId,
			xpBefore = excluded.xpBefore,
			unseenWordIds = excluded.unseenWordIds,
			results = excluded.results;
	`,
	saveResults: `
		UPDATE flashcardCycles SET results = ?
		WHERE userId = ? AND sessionId = ?;
	`,
	advanceDeck: `
		UPDATE flashcardCycles SET
			deckIndex = deckIndex + 1,
			sessionId = '',
			results = '[]'
		WHERE userId = ? AND deckId = ? AND sessionId = ?;
	`,
};

/**
 * Reopen a paragraph's saved flashcard decks or start a new cycle.
 * Keeps the same order until every deck is finished.
 */
export async function getFlashcardCycle({
	database,
	userId,
	deckId,
	wordIds,
	unseenWordIds,
	targetCardsPerDeck,
}: FlashcardCycleOptions): Promise<FlashcardCycle> {
	let cycle: FlashcardCycle | undefined;

	await database.withExclusiveTransactionAsync(async transaction => {
		const savedCycle = await transaction.getFirstAsync<FlashcardCycleRow>(
			statements.getCycle,
			userId,
			deckId,
		);
		const decks: string[][] = savedCycle ? JSON.parse(savedCycle.decks) : [];
		const savedWordIds = decks.flat();
		const currentWordIds = new Set(wordIds);
		const hasSameWords =
			savedWordIds.length === currentWordIds.size &&
			savedWordIds.every(wordId => currentWordIds.has(wordId));
		const needsNewCycle = !savedCycle || savedCycle.deckIndex >= decks.length || !hasSameWords;
		let session: DeckSessionProps;
		let cycleId = savedCycle?.cycleId ?? '';
		let deckIndex = savedCycle?.deckIndex ?? 0;
		let plannedDecks = decks;

		/**
		 * If we change a paragraph in a future update, make sure the cycle doesn't freak out
		 */
		if (needsNewCycle || !savedCycle?.sessionId) {
			const user = await transaction.getFirstAsync<UserXPRow>(statements.getUserXP, userId);

			if (!user) {
				throw new Error('Could not load the learner for these flashcards.');
			}

			session = createDeckSession(user.totalXP);

			if (needsNewCycle) {
				plannedDecks = createFlashcardDecks(wordIds, targetCardsPerDeck);
				cycleId = session.id;
				deckIndex = 0;
			}

			session.unseenWordIds = unseenWordIds.filter(wordId => {
				return plannedDecks[deckIndex]?.includes(wordId);
			});

			await transaction.runAsync(
				statements.saveCycle,
				userId,
				deckId,
				cycleId,
				JSON.stringify(plannedDecks),
				deckIndex,
				session.id,
				session.xpBefore,
				JSON.stringify(session.unseenWordIds),
				JSON.stringify(session.results),
			);
		} else {
			session = {
				id: savedCycle.sessionId,
				xpBefore: savedCycle.xpBefore,
				unseenWordIds: JSON.parse(savedCycle.unseenWordIds),
				results: JSON.parse(savedCycle.results),
			};
		}

		cycle = {
			id: cycleId,
			decks: plannedDecks,
			deckIndex,
			session,
		};
	});

	if (!cycle) {
		throw new Error('Could not prepare the flashcard cycle.');
	}

	return cycle;
}

/**
 * Save a card's correct, incorrect, or skipped result so it stays recorded after leaving.
 * Keep an existing answer unchanged if the same save is tried again.
 */
export async function saveFlashcardResult({
	database,
	userId,
	sessionId,
	result,
}: SaveFlashcardResultOptions): Promise<void> {
	const savedCycle = await database.getFirstAsync<FlashcardCycleRow>(
		statements.getSession,
		userId,
		sessionId,
	);

	/**
	 * Sessions opened before saved cycles were added can still finish normally.
	 */
	if (!savedCycle) {
		return;
	}

	const decks: string[][] = JSON.parse(savedCycle.decks);
	const results: DeckWordResultProps[] = JSON.parse(savedCycle.results);
	const savedResult = results.find(previousResult => previousResult.wordId === result.wordId);

	if (!decks[savedCycle.deckIndex]?.includes(result.wordId)) {
		throw new Error('This word does not belong to the current flashcard deck.');
	}

	if (savedResult) {
		if (savedResult.outcome !== result.outcome) {
			throw new Error('This flashcard already has a saved answer.');
		}

		return;
	}

	results.push(result);

	await database.runAsync(statements.saveResults, JSON.stringify(results), userId, sessionId);
}

/**
 * Make the next deck available after every card has an answer.
 */
export async function finishFlashcardDeck({
	database,
	userId,
	deckId,
	sessionId,
}: FinishFlashcardDeckOptions): Promise<void> {
	const savedCycle = await database.getFirstAsync<FlashcardCycleRow>(
		statements.getCycle,
		userId,
		deckId,
	);

	if (!savedCycle || savedCycle.sessionId !== sessionId) {
		return;
	}

	const decks: string[][] = JSON.parse(savedCycle.decks);
	const results: DeckWordResultProps[] = JSON.parse(savedCycle.results);
	const currentDeck = decks[savedCycle.deckIndex] ?? [];
	const hasEveryResult =
		currentDeck.length > 0 &&
		currentDeck.every(wordId => {
			return results.some(result => result.wordId === wordId);
		});

	if (!hasEveryResult) {
		throw new Error('Finish every flashcard before moving to the next deck.');
	}

	await database.runAsync(statements.advanceDeck, userId, deckId, sessionId);
}
