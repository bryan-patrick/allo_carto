import {
	deleteDatabaseAsync,
	openDatabaseAsync,
	type SQLiteDatabase,
} from 'expo-sqlite';

let db: SQLiteDatabase | null = null;

/**
 * Use the connection opened by SQLiteProvider for the whole application.
 */
export function setDB(database: SQLiteDatabase): void {
	db = database;
}

/**
 * Get the SQLite DB
 */
export async function getDB(): Promise<SQLiteDatabase> {
	try {
		if (db) {
			return db;
		}

		db = await openDatabaseAsync('allo_carto.db');

		if (!db) {
			throw new Error('DB not found, SQLite.openDatabaseAsync failed.');
		}

		return db;
	} catch (e) {
		console.error('Failed to init db:', e);
		throw e;
	}
}

/**
 * Close any cached connection before deleting the database file.
 */
export async function deleteDB(): Promise<void> {
	const database = db;
	db = null;

	if (database) {
		await database.closeAsync();
	}

	await deleteDatabaseAsync('allo_carto.db');
}

/**
 * Just a logging helper
 */
export async function logThisIfItFails<T>(
	message: string,
	fn: () => Promise<T>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		console.error(`DB step failed: ${message}`, error);
		throw error;
	}
}
