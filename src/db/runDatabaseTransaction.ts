import type { SQLiteDatabase } from 'expo-sqlite';

type DatabaseTransactionWrite = (transaction: SQLiteDatabase) => Promise<void>;

let pendingDatabaseWrite: Promise<void> = Promise.resolve();

/*
 * Let each database save finish before the next one starts, even across screens.
 * Keep each save's changes together so a failed save leaves no partial rewards or progress.
 */
export function runDatabaseTransaction(
	database: SQLiteDatabase,
	write: DatabaseTransactionWrite,
): Promise<void> {
	const result = pendingDatabaseWrite.then(saveChanges);

	// Report a failed save to its caller, but let the next save take its turn.
	pendingDatabaseWrite = result.catch(continueAfterFailedSave);

	function saveChanges(): Promise<void> {
		const result = database.withExclusiveTransactionAsync(write);

		return result;
	}

	function continueAfterFailedSave(): void {
		// The original result still carries the error back to the screen that requested the save.
	}

	return result;
}
