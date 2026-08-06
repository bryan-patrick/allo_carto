import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Increments the seen count row on the userWords table
 */
export async function incrementSeenCount(
	userId: string,
	wordId: string,
	database: SQLiteDatabase,
): Promise<void> {
	await database.runAsync(
		`
		INSERT INTO userWords (
			userId,
			wordId,
			seenCount
		)
		VALUES (?, ?, 1)
		ON CONFLICT(userId, wordId)
		DO UPDATE SET
			seenCount = seenCount + 1;
		`,
		[userId, wordId],
	);
}
