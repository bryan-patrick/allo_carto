import { getAtlasCompletionItems } from '@/src/util/atlasCompletion';
import type { ProgressById, UserProgressRow } from '@/src/util/progression';
import { getWordProgressKeyFromCounts, type WordProgressKey } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';
import { emptyDeckWordProgressCounts } from './getDeckWordProgressCounts';

interface GetUserProgressOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface UserWordProgressRow {
	wordId: string;
	correctCount: number;
	seenCount: number;
}

interface SolveCompletionRow {
	deckId: string;
}

/**
 * We load vocabulary progress and saved puzzle completions separately.
 * Seeing or learning words never counts as solving a paragraph.
 */
export default async function getUserProgress({
	database,
	userId,
}: GetUserProgressOptions): Promise<ProgressById> {
	const statements = {
		getProgress: `
			SELECT userId, id, type, completionPercentage, hasStartedFlashcards
			FROM userProgress WHERE userId = ?;
		`,
		getWords: 'SELECT wordId, correctCount, seenCount FROM userWords WHERE userId = ?;',
		getCompletions: 'SELECT deckId FROM solveCompletions WHERE userId = ?;',
	};
	const result: ProgressById = {};
	const rows = await database.getAllAsync<UserProgressRow>(statements.getProgress, userId);
	const words = await database.getAllAsync<UserWordProgressRow>(statements.getWords, userId);
	const completions = await database.getAllAsync<SolveCompletionRow>(
		statements.getCompletions,
		userId,
	);
	const savedParagraphIds = completions.map(completion => completion.deckId);
	const completedParagraphs = new Set(savedParagraphIds);
	const wordProgressById = new Map<string, WordProgressKey>();

	for (const word of words) {
		const wordProgress = getWordProgressKeyFromCounts(word);
		wordProgressById.set(word.wordId, wordProgress);
	}

	for (const row of rows) {
		result[row.id] = row;
	}

	for (const item of getAtlasCompletionItems()) {
		const wordProgressCounts = {
			...emptyDeckWordProgressCounts,
		};
		const completedParagraphIds = item.paragraphIds.filter(id => completedParagraphs.has(id));
		const completedParagraphCount = completedParagraphIds.length;
		const paragraphCount = item.paragraphIds.length;
		const currentProgress = result[item.id] ?? {
			userId,
			id: item.id,
			type: item.type,
			completionPercentage: 0,
		};
		let seenPercentage = 0;
		let seenWordCount = 0;

		for (const wordId of item.wordIds) {
			const wordProgress = wordProgressById.get(wordId) ?? 'unseen';
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
			completedParagraphCount,
			paragraphCount,
			hasFirstGem: paragraphCount > 0 && completedParagraphCount === paragraphCount,
		};
	}

	return result;
}
