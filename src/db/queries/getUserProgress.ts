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

	return result;
}
