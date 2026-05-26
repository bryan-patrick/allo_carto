import { seedWords } from '@/data/french/words';
import * as SQLite from 'expo-sqlite';

/**
 * Expo does the heavy lifting here for us.
 * This includes where the DB is stored and
 * init functions.
 *
 * Note we added "expo-sqlite" in package.json.
 * Also, expo comes with some cool SQLite expo TS features.
 * https://docs.expo.dev/versions/latest/sdk/sqlite/
 *
 * SQLite syntax
 * https://www.sqlite.org/lang.html
 *
 * Cool expo TS features
 *
 * Our DB dir is for our own seeders and queries/interface.
 */
export default async function getDB() {
	console.log('seedwords', seedWords);

	try {
		const db: SQLite.SQLiteDatabase =
			await SQLite.openDatabaseAsync('allo_carto.db');

		await getTables(db);

		if (!db) {
			console.log('Connected to SQLite3 DB via Expo');
			throw new Error('DB not found, SQLite.openDatabaseAsync failed.');
		}
	} catch (e) {
		console.error('Failed to init db:', e);
	}
}

/**
 * Check if are tables exist and are seeded.
 * If not, call the seeder
 */
async function getTables(db: SQLite.SQLiteDatabase) {
	try {
		/**
		 * Check/Create word table
		 */
		await db.execAsync(`
				CREATE TABLE IF NOT EXISTS words (
					id TEXT PRIMARY KEY,
					frenchWord TEXT NOT NULL,
					englishWords TEXT NOT NULL,
					frenchArticle TEXT,
					englishArticle TEXT,
					pronunciation TEXT NOT NULL,
					isVulgar INTEGER NOT NULL,
					CEFR TEXT NOT NULL,
					lemmaId TEXT,
					tense TEXT,
					gender TEXT,
					partOfSpeech TEXT,
					userScore INTEGER NOT NULL,
					rarity TEXT
				);
			`);

		/**
		 * Get rows amount from words table
		 */

		const rows = await db.getFirstAsync<{ count: number }>(`
			SELECT COUNT(*) as count
			FROM words
		`);

		console.log('seedlen', seedWords.length);
		console.log('rowslen', rows?.count);

		if (!rows?.count || rows.count < seedWords.length) {
			for (const word of seedWords) {
				await db.runAsync(
					`
						INSERT INTO words (
							id,
							frenchWord,
							englishWords,
							pronunciation,
							isVulgar,
							CEFR,
							userScore
						)
						VALUES (?, ?, ?, ?, ?, ?, ?)
    			`,
					[
						word.id,
						word.frenchWord,
						JSON.stringify(word.englishWords),
						word.pronunciation,
						word.isVulgar ? 1 : 0,
						word.CEFR,
						word.userScore,
					],
				);
			}
		}
	} catch (error) {
		console.error('Failed to create tables.', error);
	}
}

/**
 * Delete the sqlite DB for testing
 * (It's safe, we have seeders)
 */
export async function deleteDB() {
	await SQLite.deleteDatabaseAsync('allo_carto.db');
}
