import { findCompletionPath } from '@/src/util/atlasCompletion';
import { getDB, logThisIfItFails } from '../connection';

const createUserProgressTableSQL = `
	CREATE TABLE IF NOT EXISTS userProgress (
		userId TEXT NOT NULL,
		id TEXT NOT NULL,
		type TEXT NOT NULL CHECK (type IN ('story', 'chapter', 'paragraph')),
		completionPercentage REAL NOT NULL DEFAULT 0
			CHECK (completionPercentage >= 0 AND completionPercentage <= 100),
		hasStartedFlashcards INTEGER NOT NULL DEFAULT 0,
		isUnlocked INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (userId, id),
		FOREIGN KEY (userId) REFERENCES users(id)
	);
`;

async function createWordsTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Check/Create word table
	 */
	await logThisIfItFails('Oops we messed up creating the words table somehows', async () => {
		await database.execAsync(`
				CREATE TABLE IF NOT EXISTS words (
					id TEXT PRIMARY KEY,
					frenchWord TEXT NOT NULL,
					englishWords TEXT NOT NULL,
					frenchArticle TEXT,
					englishArticle TEXT,
					pronunciation TEXT NOT NULL,
					ipaPronunciation TEXT NOT NULL,
					isVulgar INTEGER NOT NULL,
					CEFR TEXT NOT NULL,
					lemmaId TEXT,
					form TEXT,
					tense TEXT,
					gender TEXT,
					partOfSpeech TEXT,
					correctCount INTEGER NOT NULL,
					rarity TEXT NOT NULL
				);
			`);
	});
}

async function ensureWordsFormColumn(): Promise<void> {
	const database = await getDB();

	await logThisIfItFails('Oops we messed up adding the words form column', async () => {
		const columns =
			(await database.getAllAsync<{ name: string }>('PRAGMA table_info(words)')) ?? [];
		const hasFormColumn = columns.some(column => column.name === 'form');

		if (!hasFormColumn) {
			await database.execAsync('ALTER TABLE words ADD COLUMN form TEXT;');
		}
	});
}

async function createUsersTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Create users table
	 */
	await logThisIfItFails('Oops we messed up the users table somehows mon homme', async () => {
		await database.execAsync(`
				CREATE TABLE IF NOT EXISTS users (
					id TEXT PRIMARY KEY,
					name TEXT,
					isMonHomme INTEGER NOT NULL DEFAULT 1,
					totalXP INTEGER NOT NULL DEFAULT 0 CHECK (totalXP >= 0)
				);
			`);
	});
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

/**
 * Create the user progress table
 */
async function createUserProgressTable(): Promise<void> {
	const database = await getDB();

	await logThisIfItFails('Oops our progress table messed up', async () => {
		await database.execAsync(createUserProgressTableSQL);
	});
}

export default async function createTables(): Promise<void> {
	await createWordsTable();
	await ensureWordsFormColumn();
	await createUsersTable();
	await createUserWordsTable();
	await createUserProgressTable();
	await createDeckCompletionsTable();
	await ensureFlashcardsStartedColumn();
	await ensureUnlockedColumn();
	await ensureParagraphProgressType();
	await createDeckPassageFeedbackTable();
}

/**
 * We rename the saved deck progress to paragraph progress without changing IDs or unlocks.
 * SQLite needs a new table because the old table only allows the name "deck".
 */
async function ensureParagraphProgressType(): Promise<void> {
	const statements = {
		getTable: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'userProgress';",
		renameOldTable: 'ALTER TABLE userProgress RENAME TO userProgressWithDeckTypes;',
		copyProgress: `
			INSERT INTO userProgress (
				userId, id, type, completionPercentage, hasStartedFlashcards, isUnlocked
			)
			SELECT
				userId,
				id,
				CASE WHEN type = 'deck' THEN 'paragraph' ELSE type END,
				completionPercentage,
				hasStartedFlashcards,
				isUnlocked
			FROM userProgressWithDeckTypes;
		`,
		removeOldTable: 'DROP TABLE userProgressWithDeckTypes;',
	};
	const database = await getDB();
	const table = await database.getFirstAsync<{ sql: string }>(statements.getTable);
	const hasDeckProgressType = table?.sql.includes("'deck'");

	if (hasDeckProgressType) {
		// We save this together so a failed copy leaves the original progress in place.
		await database.withExclusiveTransactionAsync(async transaction => {
			await transaction.execAsync(statements.renameOldTable);
			await transaction.execAsync(createUserProgressTableSQL);
			await transaction.execAsync(statements.copyProgress);
			await transaction.execAsync(statements.removeOldTable);
		});
	}
}

/**
 * Keep previously studied decks and their parents accessible after the upgrade.
 */
async function ensureUnlockedColumn(): Promise<void> {
	const statements = {
		getColumns: 'PRAGMA table_info(userProgress);',
		addUnlockedColumn: `
			ALTER TABLE userProgress
			ADD COLUMN isUnlocked INTEGER NOT NULL DEFAULT 0;
		`,
		getStudiedDecks: `
			SELECT userId, id
			FROM userProgress
			WHERE hasStartedFlashcards = 1;
		`,
		saveUnlockedProgress: `
			INSERT INTO userProgress (userId, id, type, completionPercentage, isUnlocked)
			VALUES (?, ?, ?, 0, 1)
			ON CONFLICT(userId, id)
			DO UPDATE SET isUnlocked = 1;
		`,
	};

	const progressTypes = ['story', 'chapter', 'deck'] as const;
	const database = await getDB();
	const columns = await database.getAllAsync<{ name: string }>(statements.getColumns);
	const hasUnlockedColumn = columns.some(column => column.name === 'isUnlocked');

	if (!hasUnlockedColumn) {
		await database.withExclusiveTransactionAsync(async transaction => {
			await transaction.execAsync(statements.addUnlockedColumn);

			const studiedDecks = await transaction.getAllAsync<{ userId: string; id: string }>(
				statements.getStudiedDecks,
			);

			for (const deck of studiedDecks) {
				const path = findCompletionPath({ id: deck.id });

				for (const [index, item] of path.entries()) {
					const type = progressTypes[index];

					await transaction.runAsync(statements.saveUnlockedProgress, deck.userId, item.id, type);
				}
			}
		});
	}
}

/**
 * Preserve completed flashcard decks when upgrading existing databases.
 */
async function ensureFlashcardsStartedColumn(): Promise<void> {
	const database = await getDB();
	const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(userProgress)');

	if (columns.some(column => column.name === 'hasStartedFlashcards')) {
		return;
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		await transaction.execAsync(`
			ALTER TABLE userProgress ADD COLUMN hasStartedFlashcards INTEGER NOT NULL DEFAULT 0;
			INSERT INTO userProgress (userId, id, type, completionPercentage, hasStartedFlashcards)
			SELECT DISTINCT userId, deckId, 'deck', 0, 1 FROM deckCompletions WHERE 1
			ON CONFLICT(userId, id) DO UPDATE SET hasStartedFlashcards = 1;
		`);
	});
}

/**
 * Saves a record with a unique session ID when a deck is completed.
 * The session key is to prevent duplicate rewards or XP
 */
async function createDeckCompletionsTable(): Promise<void> {
	const database = await getDB();

	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS deckCompletions (
			userId TEXT NOT NULL,
			sessionId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			bonuses TEXT NOT NULL,
			totalXP INTEGER NOT NULL CHECK (totalXP >= 0),
			PRIMARY KEY (userId, sessionId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
		CREATE INDEX IF NOT EXISTS deckCompletionsByDeck
			ON deckCompletions (userId, deckId);
	`);
}

/**
 * Save one Yes or No answer each time the user tries a deck
 * This one is actually pretty easy
 */
async function createDeckPassageFeedbackTable(): Promise<void> {
	const database = await getDB();

	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS deckPassageFeedback (
			userId TEXT NOT NULL,
			sessionId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			isEasierToRead INTEGER NOT NULL CHECK (isEasierToRead IN (0, 1)),
			correctCount INTEGER NOT NULL CHECK (correctCount >= 0),
			incorrectCount INTEGER NOT NULL CHECK (incorrectCount >= 0),
			skippedCount INTEGER NOT NULL CHECK (skippedCount >= 0),
			answeredAt TEXT NOT NULL,
			PRIMARY KEY (userId, sessionId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
		CREATE INDEX IF NOT EXISTS deckPassageFeedbackByDeck
			ON deckPassageFeedback (userId, deckId);
	`);
}
