import type { FlashcardDeckProgress } from '@/src/components/CardDeck/cardDeckTypes';
import { getAtlasCompletionItems } from '@/src/util/atlasCompletion';
import type { ProgressById, UserProgressRow } from '@/src/util/progression';
import type { CompletedSolveStages, SolveStage } from '@/src/util/solveProgression';
import type { SQLiteDatabase } from 'expo-sqlite';
import { emptyDeckWordProgressCounts } from './getDeckWordProgressCounts';
import getUserWordProgress, { type UserWordProgressById } from './getUserWordProgress';

interface GetUserProgressOptions {
	database: SQLiteDatabase;
	userId: string;
	wordProgressById?: UserWordProgressById;
}

interface SolveCompletionRow {
	deckId: string;
	completedSolveStages: CompletedSolveStages;
}

interface StartedSolveStageRow {
	deckId: string;
	stage: SolveStage;
}

interface FlashcardCycleProgressRow {
	deckId: string;
	decks: string;
	deckIndex: number;
}

/**
 * Loads saved flashcard and puzzle progress for paragraphs, chapters, and stories.
 */
export default async function getUserProgress({
	database,
	userId,
	wordProgressById,
}: GetUserProgressOptions): Promise<ProgressById> {
	const statements = {
		getProgress: `
			SELECT userId, id, type, completionPercentage, hasStartedFlashcards
			FROM userProgress WHERE userId = ?;
		`,
		getCompletions: 'SELECT deckId, completedSolveStages FROM solveCompletions WHERE userId = ?;',
		getFlashcardCycles: 'SELECT deckId, decks, deckIndex FROM flashcardCycles WHERE userId = ?;',
		getStartedSolveStages: `
			SELECT deckId, 1 AS stage FROM solveAttempts WHERE userId = ?
			UNION
			SELECT deckId, stage FROM solveStageAttempts WHERE userId = ?
			UNION
			SELECT deckId, 1 AS stage FROM solvePositions WHERE userId = ?
			UNION
			SELECT deckId, stage FROM solveStagePositions WHERE userId = ?
			UNION
			SELECT deckId, 3 AS stage FROM solveWordOrderDrafts WHERE userId = ?;
		`,
	};
	const result: ProgressById = {};
	const rows = await database.getAllAsync<UserProgressRow>(statements.getProgress, userId);
	const savedWordProgress =
		wordProgressById ??
		(await getUserWordProgress({
			database,
			userId,
		}));
	const completions = await database.getAllAsync<SolveCompletionRow>(
		statements.getCompletions,
		userId,
	);
	const completedStagesByParagraph = new Map<string, CompletedSolveStages>();
	const flashcardCycles = await database.getAllAsync<FlashcardCycleProgressRow>(
		statements.getFlashcardCycles,
		userId,
	);
	const flashcardCyclesByParagraph = new Map<string, FlashcardCycleProgressRow>();
	const startedSolveStageRows = await database.getAllAsync<StartedSolveStageRow>(
		statements.getStartedSolveStages,
		userId,
		userId,
		userId,
		userId,
		userId,
	);
	const startedSolveStagesByParagraph = new Map<string, SolveStage[]>();

	/**
	 * Count incorrect answers and saved card arrangements as started puzzles too.
	 */
	for (const row of startedSolveStageRows) {
		const startedSolveStages = startedSolveStagesByParagraph.get(row.deckId) ?? [];

		startedSolveStages.push(row.stage);
		startedSolveStagesByParagraph.set(row.deckId, startedSolveStages);
	}

	for (const cycle of flashcardCycles) {
		flashcardCyclesByParagraph.set(cycle.deckId, cycle);
	}

	for (const completion of completions) {
		completedStagesByParagraph.set(completion.deckId, completion.completedSolveStages);
	}

	for (const row of rows) {
		result[row.id] = row;
	}

	for (const item of getAtlasCompletionItems()) {
		const wordProgressCounts = {
			...emptyDeckWordProgressCounts,
		};
		const completedParagraphIds = item.paragraphIds.filter(paragraphId => {
			const completedStages = completedStagesByParagraph.get(paragraphId) ?? 0;

			return completedStages >= 3;
		});
		const completedParagraphCount = completedParagraphIds.length;
		const paragraphCount = item.paragraphIds.length;
		const savedCycle = flashcardCyclesByParagraph.get(item.id);
		const currentProgress = result[item.id] ?? {
			userId,
			id: item.id,
			type: item.type,
			completionPercentage: 0,
		};
		let seenPercentage = 0;
		let seenWordCount = 0;
		let completedSolveStages: CompletedSolveStages = 0;
		let flashcardProgress: FlashcardDeckProgress | undefined;

		if (paragraphCount > 0) {
			completedSolveStages = 5;
		}

		// Keep the saved deck number until the cycle ends or the paragraph's words change.
		if (savedCycle) {
			const decks: string[][] = JSON.parse(savedCycle.decks);
			const savedWordIds = decks.flat();
			const paragraphWordIds = new Set(item.wordIds);
			const hasSameWords =
				savedWordIds.length === paragraphWordIds.size &&
				savedWordIds.every(wordId => paragraphWordIds.has(wordId));

			if (hasSameWords && savedCycle.deckIndex < decks.length) {
				flashcardProgress = {
					deckIndex: savedCycle.deckIndex,
					deckCount: decks.length,
				};
			}
		}

		for (const paragraphId of item.paragraphIds) {
			const paragraphStages = completedStagesByParagraph.get(paragraphId) ?? 0;

			if (paragraphStages < completedSolveStages) {
				completedSolveStages = paragraphStages;
			}
		}

		for (const wordId of item.wordIds) {
			const wordProgress = savedWordProgress[wordId] ?? 'unseen';
			wordProgressCounts[wordProgress]++;
		}

		seenWordCount = item.wordIds.length - wordProgressCounts.unseen;

		if (item.wordIds.length > 0) {
			seenPercentage = (seenWordCount / item.wordIds.length) * 100;
		}

		result[item.id] = {
			...currentProgress,
			seenPercentage,
			seenWordCount,
			wordCount: item.wordIds.length,
			wordProgressCounts,
			flashcardProgress,
			completedParagraphCount,
			paragraphCount,
			completedSolveStages,
			startedSolveStages: startedSolveStagesByParagraph.get(item.id) ?? [],
			hasFirstGem: paragraphCount > 0 && completedSolveStages >= 1,
		};
	}

	return result;
}
