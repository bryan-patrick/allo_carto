import type { SQLiteDatabase } from 'expo-sqlite';
import type { ProgressType } from '@/src/util/progression';

/**
 * Create or update one row in the userProgress table
 */
export default async function updateUserProgress({
	completionPercentage,
	database,
	id,
	type,
	userId,
}: {
	completionPercentage: number;
	database: SQLiteDatabase;
	id: string;
	type: ProgressType;
	userId: string;
}): Promise<void> {
	/**
	 * Create the row if it is missing
	 */
	await database.runAsync(
		`
		INSERT INTO userProgress (
			userId,
			id,
			type,
			completionPercentage
		)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(userId, id)
		DO UPDATE SET
			type = excluded.type,
			completionPercentage = excluded.completionPercentage;
		`,
		userId,
		id,
		type,
		completionPercentage,
	);
}
