import { getWordProgressKeyFromCounts, type WordProgressKey } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';

export type UserWordProgressById = Partial<Record<string, WordProgressKey>>;

interface GetUserWordProgressOptions {
	database: SQLiteDatabase;
	userId: string;
	shouldRequireCorrectAnswer?: boolean;
}

interface UserWordProgressRow {
	wordId: string;
	correctCount: number;
	seenCount: number;
}

/**
 * Loads saved word levels and can limit them to words answered correctly at least once.
 */
export default async function getUserWordProgress({
	database,
	userId,
	shouldRequireCorrectAnswer = false,
}: GetUserWordProgressOptions): Promise<UserWordProgressById> {
	const progressByWordId: UserWordProgressById = {};
	let statement = 'SELECT wordId, correctCount, seenCount FROM userWords WHERE userId = ?';

	if (shouldRequireCorrectAnswer) {
		statement += ' AND correctCount > 0';
	}

	const rows = await database.getAllAsync<UserWordProgressRow>(statement, userId);

	for (const row of rows) {
		progressByWordId[row.wordId] = getWordProgressKeyFromCounts(row);
	}

	return progressByWordId;
}
