import { getWordProgressKeyFromCounts, type WordProgressKey } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';

export type UserWordProgressById = Partial<Record<string, WordProgressKey>>;

interface GetUserWordProgressOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface UserWordProgressRow {
	wordId: string;
	correctCount: number;
	seenCount: number;
}

/*
 * Loads the player's word levels so stories and collections use the same saved progress.
 */
export default async function getUserWordProgress({
	database,
	userId,
}: GetUserWordProgressOptions): Promise<UserWordProgressById> {
	const statement = 'SELECT wordId, correctCount, seenCount FROM userWords WHERE userId = ?;';
	const progressByWordId: UserWordProgressById = {};
	const rows = await database.getAllAsync<UserWordProgressRow>(statement, userId);

	for (const row of rows) {
		progressByWordId[row.wordId] = getWordProgressKeyFromCounts(row);
	}

	return progressByWordId;
}
