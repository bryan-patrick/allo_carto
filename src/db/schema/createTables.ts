import { getDB, logThisIfItFails } from '../connection';

async function createWordsTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Check/Create word table
	 */
	await logThisIfItFails(
		'Oops we messed up creating the words table somehows',
		async () => {
			await database.execAsync(`
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
					correctCount INTEGER NOT NULL,
					rarity TEXT
				);
			`);
		},
	);
}

async function createUsersTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Create users table
	 */
	await logThisIfItFails(
		'Oops we messed up the users table somehows mon homme',
		async () => {
			await database.execAsync(`
				CREATE TABLE IF NOT EXISTS users (
					id TEXT PRIMARY KEY,
					name TEXT,
					isMonHomme INTEGER NOT NULL DEFAULT 1
				);
			`);
		},
	);
}

async function createUserWordsTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Create user word score join table - many (users) to many (words).
	 * The table to store progress for a specific word per user.
	 *
	 * A user can only have one record for a given word
	 * so I made the primary key userId and wordId...should work...
	 */
	await logThisIfItFails('Oops our join table messed up', async () => {
		await database.execAsync(`
			CREATE TABLE IF NOT EXISTS userWords (
				userId TEXT NOT NULL,
				wordId TEXT NOT NULL,
				seenCount INTEGER NOT NULL DEFAULT 0,
				correctCount INTEGER NOT NULL DEFAULT 0,
				PRIMARY KEY (userId, wordId),
				FOREIGN KEY (userId) REFERENCES users(id),
				FOREIGN KEY (wordId) REFERENCES words(id)
			)
		`);
	});
}

export default async function createTables(): Promise<void> {
	await createWordsTable();
	await createUsersTable();
	await createUserWordsTable();
}
