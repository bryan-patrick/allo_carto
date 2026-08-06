import { getDB } from './connection';
import getTables from './getTables';

/**
 * Reset the local database back to seeded data.
 *
 * This mirrors the old debug flag in AppLayout, but keeps it safe to call
 * while the app is running by using the existing open database connection.
 */
export default async function resetDB(): Promise<void> {
	const database = await getDB();

	await database.execAsync(`
		DROP TABLE IF EXISTS userProgress;
		DROP TABLE IF EXISTS userWords;
		DROP TABLE IF EXISTS users;
		DROP TABLE IF EXISTS words;
	`);

	await getTables();
}
