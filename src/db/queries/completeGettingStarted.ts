import { getDB } from '../connection';
import { runDatabaseTransaction } from '../runDatabaseTransaction';

// Remember that the player finished the tutorial so it doesn't open again
export default async function completeGettingStarted(userId: string): Promise<void> {
	const database = await getDB();
	const statement = 'UPDATE users SET hasCompletedGettingStarted = 1 WHERE id = ?;';

	await runDatabaseTransaction(database, async function saveTutorialCompletion(transaction) {
		const result = await transaction.runAsync(statement, userId);

		if (result.changes !== 1) {
			throw new Error('Could not save the completed getting started tutorial.');
		}
	});
}
