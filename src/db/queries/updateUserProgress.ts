import type { SQLiteDatabase } from 'expo-sqlite';
import type { ProgressItem } from '@/src/util/atlasProgression';

/**
 * Update one progress row
 */
export default async function updateUserProgress({
	completionPercentage,
	database,
	item,
	userId,
}: {
	completionPercentage: number;
	database: SQLiteDatabase;
	item: ProgressItem;
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
		item.id,
		item.type,
		completionPercentage,
	);
}
