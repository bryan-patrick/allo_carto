import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Gets the SQLite DB
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
	try {
		if (db) {
			return db;
		}

		db = await SQLite.openDatabaseAsync('allo_carto.db');

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
