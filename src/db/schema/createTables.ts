import { getDB, logThisIfItFails } from '../connection';

/**
 * Player progress table
 */
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

/**
 * Creates the words table for French words, English words, and card details.
 *
 * Off we go again.
 */
async function createWordsTable(): Promise<void> {
	const database = await getDB();

	await logThisIfItFails('Oops we messed up creating the words table somehows', async () => {
		await database.execAsync(`
				CREATE TABLE IF NOT EXISTS words (
					id TEXT PRIMARY KEY,
					frenchWord TEXT NOT NULL,
					englishWords TEXT NOT NULL,
					canonicalEnglish TEXT,
					tip TEXT,
					frenchArticle TEXT,
					englishArticle TEXT,
					englishPrefixes TEXT,
					pronunciation TEXT NOT NULL,
					ipaPronunciation TEXT NOT NULL,
					isVulgar INTEGER NOT NULL,
					isQuebecois INTEGER NOT NULL DEFAULT 0 CHECK (isQuebecois IN (0, 1)),
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

/**
 * Creates the users table for player profiles, their selected story, and XP.
 */
async function createUsersTable(): Promise<void> {
	const database = await getDB();

	await logThisIfItFails('Oops we messed up the users table somehows mon homme', async () => {
		await database.execAsync(`
				CREATE TABLE IF NOT EXISTS users (
					id TEXT PRIMARY KEY,
					name TEXT,
					isMonHomme INTEGER NOT NULL DEFAULT 1,
					hasCompletedGettingStarted INTEGER NOT NULL DEFAULT 0,
					selectedStoryId TEXT,
					totalXP INTEGER NOT NULL DEFAULT 0 CHECK (totalXP >= 0)
				);
			`);
	});
}

/**
 * Creates the userWords table for how often each player sees and correctly answers each word.
 */
async function createUserWordsTable(): Promise<void> {
	const database = await getDB();

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
 * Creates the userProgress table for story, chapter, and paragraph progress.
 */
async function createUserProgressTable(): Promise<void> {
	const database = await getDB();

	await logThisIfItFails('Oops our progress table messed up', async () => {
		await database.execAsync(createUserProgressTableSQL);
	});
}

/**
 * Creates all the app's tables.
 */
export default async function createTables(): Promise<void> {
	await createWordsTable();
	await createUsersTable();
	await createUserWordsTable();
	await createUserProgressTable();
	await createDeckCompletionsTable();
	await createFlashcardCyclesTable();
	await createInkTables();
	await createCollectionRewardClaimsTable();
	await createTipRewardClaimsTable();
	await createSolveTables();
	await createSolveRewardsTable();
	await createUserActivityTable();
	await createUserNotificationsTable();
}

/**
 * Creates the userNotifications table for player notifications.
 */
async function createUserNotificationsTable(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS userNotifications (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId TEXT NOT NULL,
			type TEXT NOT NULL,
			description TEXT NOT NULL,
			createdAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES users(id)
		);
		CREATE INDEX IF NOT EXISTS userNotificationsByUser
			ON userNotifications (userId, id DESC);
	`;

	await database.execAsync(statement);
}

/**
 * Creates the userActivity table for rewards, completed activities, and unlocks.
 */
async function createUserActivityTable(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS userActivity (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId TEXT NOT NULL,
			type TEXT NOT NULL,
			description TEXT NOT NULL,
			createdAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES users(id)
		);
		CREATE INDEX IF NOT EXISTS userActivityByUser
			ON userActivity (userId, id DESC);
	`;

	await database.execAsync(statement);
}

/**
 * Creates the solveRewards table for puzzle XP and whether each reward has been claimed.
 */
async function createSolveRewardsTable(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS solveRewards (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
			kind TEXT NOT NULL CHECK (kind IN ('card', 'gem')),
			position INTEGER NOT NULL CHECK (position >= 0),
			xp INTEGER NOT NULL CHECK (xp > 0),
			claimedAt INTEGER,
			PRIMARY KEY (userId, deckId, stage, kind, position),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
	`;

	await database.execAsync(statement);
}

/**
 * Creates the flashcardCycles table for saved flashcard decks and answers.
 */
async function createFlashcardCyclesTable(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS flashcardCycles (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			cycleId TEXT NOT NULL,
			decks TEXT NOT NULL,
			deckIndex INTEGER NOT NULL DEFAULT 0 CHECK (deckIndex >= 0),
			sessionId TEXT NOT NULL,
			xpBefore INTEGER NOT NULL CHECK (xpBefore >= 0),
			unseenWordIds TEXT NOT NULL DEFAULT '[]',
			results TEXT NOT NULL DEFAULT '[]',
			PRIMARY KEY (userId, deckId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
	`;

	await database.execAsync(statement);
}

/**
 * Creates the collectionRewardClaims table for claimed collection XP.
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
 * Creates the tipRewardClaims table for each player's claimed tip XP.
 */
async function createTipRewardClaimsTable(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS tipRewardClaims (
			userId TEXT NOT NULL,
			tipId TEXT NOT NULL,
			xp INTEGER NOT NULL CHECK (xp > 0),
			claimedAt INTEGER NOT NULL,
			PRIMARY KEY (userId, tipId),
			FOREIGN KEY (userId) REFERENCES users(id)
		);
	`;

	await database.execAsync(statement);
}

/**
 * Creates the tables for puzzle answers, attempts, card orders, and completed puzzles.
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
	await createSolveStageTables();
}

/**
 * Creates the tables for later puzzles' card orders, locks, answers, and attempts.
 */
async function createSolveStageTables(): Promise<void> {
	const database = await getDB();
	const statement = `
		CREATE TABLE IF NOT EXISTS solveWordOrderDrafts (
			userId TEXT NOT NULL,
			deckId TEXT NOT NULL,
			positions TEXT NOT NULL,
			lockedCardIds TEXT NOT NULL DEFAULT '[]',
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
 * Creates the deckCompletions table for completed flashcard sessions and their rewards.
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
}

/**
 * Creates the tables for Ink balances and flashcard rewards.
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
