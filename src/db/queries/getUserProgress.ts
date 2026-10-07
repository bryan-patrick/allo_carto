import { getAtlasCompletionItems } from '@/src/util/atlasCompletion';
import type { ProgressById, UserProgressRow } from '@/src/util/progression';
import type { SQLiteDatabase } from 'expo-sqlite';

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
			completionPercentage
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
	const seenWords = await database.getAllAsync<{ wordId: string }>(
		`
		SELECT wordId
		FROM userWords
		WHERE userId = ? AND (seenCount > 0 OR correctCount > 0);
		`,
		userId,
	);
	const seenWordIds = new Set(seenWords.map(word => word.wordId));

	for (const item of getAtlasCompletionItems()) {
		const seenWordCount = item.wordIds.filter(wordId => seenWordIds.has(wordId)).length;
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
		};
	}

	return result;
}
