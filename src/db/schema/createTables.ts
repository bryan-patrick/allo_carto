import { getDB, logThisIfItFails } from '../connection';

interface DatabaseColumn {
	name: string;
}

const createUserProgressTableSQL = `
	CREATE TABLE IF NOT EXISTS userProgress (
		userId TEXT NOT NULL,
		id TEXT NOT NULL,
		type TEXT NOT NULL CHECK (type IN ('story', 'chapter', 'paragraph')),
		completionPercentage REAL NOT NULL DEFAULT 0
			CHECK (completionPercentage >= 0 AND completionPercentage <= 100),
		hasStartedFlashcards INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (userId, id),
		FOREIGN KEY (userId) REFERENCES users(id)
	);
`;

async function createWordsTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Stores the French words, English meanings, and card details used in flashcards and Solve.
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
	 * Stores local player profiles, their selected story, and earned XP.
	 */
	await logThisIfItFails('Oops we messed up the users table somehows mon homme', async () => {
		await database.execAsync(`
				CREATE TABLE IF NOT EXISTS users (
					id TEXT PRIMARY KEY,
					name TEXT,
					isMonHomme INTEGER NOT NULL DEFAULT 1,
					selectedStoryId TEXT,
					totalXP INTEGER NOT NULL DEFAULT 0 CHECK (totalXP >= 0)
				);
			`);
	});
}

async function createUserWordsTable(): Promise<void> {
	const database = await getDB();

	/**
	 * Stores how often each player has seen or correctly answered each word.
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
 * Stores learning progress for paragraphs, chapters, and stories, including whether flashcard practice has started.
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
	await ensureSelectedStoryColumn();
	await createUserWordsTable();
	await createUserProgressTable();
	await createDeckCompletionsTable();
	await createInkTables();
	await createCollectionRewardClaimsTable();
	await createSolveTables();
	await ensureFlashcardsStartedColumn();
	await ensureParagraphProgressType();
}

/**
 * Creates storage for claimed collections XP (receipts)
 */
async function createCollectionRewardClaimsTable(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS collectionRewardClaims (
			userId TEXT NOT NULL,
			collectionId TEXT NOT NULL,
			requiredWordProgress TEXT NOT NULL
				CHECK (requiredWordProgress IN ('new', 'learning', 'familiar', 'known', 'mastered')),
			xp INTEGER NOT NULL CHECK (xp > 0),
			claimedAt INTEGER NOT NULL,
			PRIMARY KEY (userId, collectionId, requiredWordProgress),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
	`;

	await database.execAsync(statement);
}

/**
 * Creates storage for the first Solve puzzle's unlocked cards, answers, paid attempts, and earned gem.
 * Also prepares saved progress for the later Solve puzzles.
 */
async function createSolveTables(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS solveCompletions (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			completedAt INTEGER NOT NULL,
			completedSolveStages INTEGER NOT NULL DEFAULT 1
				CHECK (completedSolveStages BETWEEN 1 AND 5),
			PRIMARY KEY (userId, deckId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS solveUnlocks (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			position INTEGER NOT NULL CHECK (position >= 0),
			wordId TEXT NOT NULL,
			PRIMARY KEY (userId, deckId, position),
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (wordId) REFERENCES words(id)
		);

		CREATE TABLE IF NOT EXISTS solvePositions (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			position INTEGER NOT NULL CHECK (position >= 0),
			wordId TEXT NOT NULL,
			acceptedAnswer TEXT NOT NULL,
			PRIMARY KEY (userId, deckId, position),
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (wordId) REFERENCES words(id)
		);
		
		CREATE TABLE IF NOT EXISTS solveAttempts (
			userId TEXT NOT NULL,
			attemptId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			position INTEGER NOT NULL,
			status TEXT NOT NULL CHECK (status IN ('exact', 'close', 'incorrect')),
			acceptedAnswer TEXT,
			inkSpent INTEGER NOT NULL CHECK (inkSpent >= 0),
			firstGemEarned INTEGER NOT NULL DEFAULT 0,
			PRIMARY KEY (userId, attemptId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
	`;

	await database.execAsync(statement);
	await ensureCompletedSolveStagesColumn();
	await createSolveStageTables();
}

/**
 * Adds a completed puzzle count when opening an older save.
 */
async function ensureCompletedSolveStagesColumn(): Promise<void> {
	const database = await getDB();
	const columns = await database.getAllAsync<DatabaseColumn>(
		'PRAGMA table_info(solveCompletions);',
	);
	const hasCompletedStagesColumn = columns.some(column => column.name === 'completedSolveStages');
	const addColumnStatement = `
		ALTER TABLE solveCompletions
		ADD COLUMN completedSolveStages INTEGER NOT NULL DEFAULT 1
			CHECK (completedSolveStages BETWEEN 1 AND 5);
	`;

	if (!hasCompletedStagesColumn) {
		await database.execAsync(addColumnStatement);
	}
}

/**
 * Creates storage for later Solve puzzles' unlocked cards, correct answers, paid attempts, and unfinished Word Order arrangements.
 */
async function createSolveStageTables(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS solveWordOrderDrafts (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			positions TEXT NOT NULL,
			PRIMARY KEY (userId, deckId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS solveStageUnlocks (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			stage INTEGER NOT NULL CHECK (stage = 2),
			position INTEGER NOT NULL CHECK (position >= 0),
			wordId TEXT NOT NULL,
			PRIMARY KEY (userId, deckId, stage, position),
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (wordId) REFERENCES words(id)
		);

		CREATE TABLE IF NOT EXISTS solveStagePositions (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			stage INTEGER NOT NULL CHECK (stage BETWEEN 2 AND 5),
			position INTEGER NOT NULL CHECK (position >= 0),
			wordId TEXT,
			acceptedAnswer TEXT NOT NULL,
			PRIMARY KEY (userId, deckId, stage, position),
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (wordId) REFERENCES words(id)
		);

		CREATE TABLE IF NOT EXISTS solveStageAttempts (
			userId TEXT NOT NULL,
			attemptId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			stage INTEGER NOT NULL CHECK (stage BETWEEN 2 AND 5),
			position INTEGER NOT NULL CHECK (position >= 0),
			answer TEXT NOT NULL,
			status TEXT NOT NULL CHECK (status IN ('exact', 'close', 'incorrect')),
			acceptedAnswer TEXT,
			inkSpent INTEGER NOT NULL CHECK (inkSpent >= 0),
			stageCompleted INTEGER NOT NULL DEFAULT 0 CHECK (stageCompleted IN (0, 1)),
			PRIMARY KEY (userId, attemptId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
	`;

	await database.execAsync(statement);
}

/**
 * Adds a saved story selection to older databases when needed.
 */
async function ensureSelectedStoryColumn(): Promise<void> {
	const database = await getDB();
	const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(users);');
	const hasSelectedStoryColumn = columns.some(column => column.name === 'selectedStoryId');

	if (!hasSelectedStoryColumn) {
		await database.execAsync('ALTER TABLE users ADD COLUMN selectedStoryId TEXT;');
	}
}

/**
 * Updates older saves to call paragraph progress "paragraph" instead of "deck".
 */
async function ensureParagraphProgressType(): Promise<void> {
	const statements = {
		getTable: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'userProgress';",
		renameOldTable: 'ALTER TABLE userProgress RENAME TO userProgressWithDeckTypes;',
		copyProgress: `
			INSERT INTO userProgress (
				userId, id, type, completionPercentage, hasStartedFlashcards
			)
			SELECT
				userId,
				id,
				CASE WHEN type = 'deck' THEN 'paragraph' ELSE type END,
				completionPercentage,
				hasStartedFlashcards
			FROM userProgressWithDeckTypes;
		`,
		removeOldTable: 'DROP TABLE userProgressWithDeckTypes;',
	};
	const database = await getDB();
	const table = await database.getFirstAsync<{ sql: string }>(statements.getTable);
	const hasDeckProgressType = table?.sql.includes("'deck'");

	if (hasDeckProgressType) {
		await database.withExclusiveTransactionAsync(async transaction => {
			await transaction.execAsync(statements.renameOldTable);
			await transaction.execAsync(createUserProgressTableSQL);
			await transaction.execAsync(statements.copyProgress);
			await transaction.execAsync(statements.removeOldTable);
		});
	}
}

/**
 * Keeps the New badge accurate when opening an older save.
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
 * Remembers finished flashcard sessions and the rewards already paid for them.
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
			earnedInk INTEGER NOT NULL DEFAULT 0 CHECK (earnedInk >= 0),
			PRIMARY KEY (userId, sessionId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
		CREATE INDEX IF NOT EXISTS deckCompletionsByDeck
			ON deckCompletions (userId, deckId);
	`);

	/**
	 * Adds the saved Ink payout to older databases.
	 */
	const columns = await database.getAllAsync<DatabaseColumn>('PRAGMA table_info(deckCompletions);');
	const hasEarnedInkColumn = columns.some(column => column.name === 'earnedInk');

	if (!hasEarnedInkColumn) {
		await database.execAsync(`
			ALTER TABLE deckCompletions
			ADD COLUMN earnedInk INTEGER NOT NULL DEFAULT 0 CHECK (earnedInk >= 0);
		`);
	}
}

/**
 * Stores the player's Ink balance and the Ink earned by correct flashcard answers.
 */
async function createInkTables(): Promise<void> {
	const statements = {
		createBalance: `
			CREATE TABLE IF NOT EXISTS userInk (
				userId TEXT PRIMARY KEY NOT NULL,
				balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
				FOREIGN KEY (userId) REFERENCES users(id)
			);
		`,
		createAwards: `
			CREATE TABLE IF NOT EXISTS flashcardAwards (
				userId TEXT NOT NULL,
				sessionId TEXT NOT NULL,
				wordId TEXT NOT NULL,
				xp INTEGER NOT NULL CHECK (xp >= 0),
				learningBonusXP INTEGER NOT NULL CHECK (learningBonusXP >= 0),
				previousProgress TEXT NOT NULL,
				nextProgress TEXT NOT NULL,
				ink INTEGER NOT NULL CHECK (ink >= 0),
				PRIMARY KEY (userId, sessionId, wordId),
				FOREIGN KEY (userId) REFERENCES users(id),
				FOREIGN KEY (wordId) REFERENCES words(id)
			);
		`,
	};

	const database = await getDB();

	await database.execAsync(statements.createBalance);
	await database.execAsync(statements.createAwards);
}
