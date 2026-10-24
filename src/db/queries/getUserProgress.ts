import { getAtlasCompletionItems } from '@/src/util/atlasCompletion';
import type { ProgressById, UserProgressRow } from '@/src/util/progression';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getWordProgressKeyFromCounts } from '@/src/util/wordProgress';
import { emptyDeckWordProgressCounts } from './getDeckWordProgressCounts';

/**
 * Load a user's userProgress rows into an ID lookup
 */
export default async function getUserProgress({
	database,
	userId,
}: {
	database: SQLiteDatabase;
	userId: string;
}): Promise<ProgressById> {
	const rows = await database.getAllAsync<UserProgressRow>(
		`
		SELECT
			userId,
			id,
			type,
			completionPercentage,
			hasStartedFlashcards,
			isUnlocked
		FROM userProgress
		WHERE userId = ?;
		`,
		userId,
	);

	/**
	 * Make the ID lookup
	 */
	const result: ProgressById = {};

	for (const row of rows) {
		result[row.id] = row;
	}

	/**
	 * Load encountered words once and count each word once per atlas item,
	 * including words shared by multiple decks in a chapter.
	 */
	const words = await database.getAllAsync<{
		wordId: string;
		correctCount: number;
		seenCount: number;
	}>(
		`
		SELECT wordId, correctCount, seenCount
		FROM userWords
		WHERE userId = ?;
		`,
		userId,
	);
	const wordProgressById = new Map(
		words.map(word => [word.wordId, getWordProgressKeyFromCounts(word)]),
	);

	for (const item of getAtlasCompletionItems()) {
		const wordProgressCounts = { ...emptyDeckWordProgressCounts };
		for (const wordId of item.wordIds) {
			wordProgressCounts[wordProgressById.get(wordId) ?? 'unseen']++;
		}
		const seenWordCount = item.wordIds.length - wordProgressCounts.unseen;
		let seenPercentage = 0;

		if (item.wordIds.length > 0) {
			seenPercentage = (seenWordCount / item.wordIds.length) * 100;
		}

		const currentProgress = result[item.id] ?? {
			userId,
			id: item.id,
			type: item.type,
			completionPercentage: 0,
		};

		result[item.id] = {
			...currentProgress,
			seenPercentage,
			seenWordCount,
			wordCount: item.wordIds.length,
			wordProgressCounts,
		};
	}

	return result;
}
