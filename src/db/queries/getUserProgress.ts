import type { ProgressById, UserProgressRow } from '@/src/util/progression';
import { getDB } from '../connection';

/**
 * Get all of a user's progress
 */
export default async function getUserProgress(
	userId: string,
): Promise<ProgressById> {
	const database = await getDB();
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
