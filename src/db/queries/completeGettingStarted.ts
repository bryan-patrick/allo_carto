import { getDB } from '../connection';

// Remember that the player finished the tutorial so it doesn't open again
export default async function completeGettingStarted(userId: string): Promise<void> {
	const database = await getDB();
	const statement = 'UPDATE users SET hasCompletedGettingStarted = 1 WHERE id = ?;';
	const result = await database.runAsync(statement, userId);

	if (result.changes !== 1) {
		throw new Error('Could not save the completed getting started tutorial.');
	}
}
