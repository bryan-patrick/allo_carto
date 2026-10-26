/// <reference types="node" />

import { getDB } from '@/src/db/connection';
import getUserInk from '@/src/db/queries/getUserInk';
import { writeCorrectAnswer, writeDeckCompletion } from '@/src/db/queries/writeUserProgress';
import createTables from '@/src/db/schema/createTables';
import { inkConfig } from '@/src/util/ink';
import type { SQLiteDatabase } from 'expo-sqlite';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

jest.mock('@/src/db/connection', () => ({
	getDB: jest.fn(),
	logThisIfItFails: async (_message: string, operation: () => Promise<void>) => operation(),
}));

interface InkTestDatabase {
	database: SQLiteDatabase;
	connection: DatabaseSync;
}

interface SavedRewards {
	totalXP: number;
	correctCount: number;
	awards: number;
}

/**
 * We run the real reward queries against SQLite here.
 * This small adapter gives Node's SQLite the async methods used by the app.
 */
function openTestDatabase(): InkTestDatabase {
	const connection = new DatabaseSync(':memory:');
	const database = {
		execAsync,
		getFirstAsync,
		getAllAsync,
		runAsync,
		withExclusiveTransactionAsync,
	} as unknown as SQLiteDatabase;

	async function execAsync(statement: string) {
		connection.exec(statement);
	}

	async function getFirstAsync(statement: string, ...parameters: SQLInputValue[]) {
		const preparedStatement = connection.prepare(statement);
		const row = preparedStatement.get(...parameters);

		return row ?? null;
	}

	async function getAllAsync(statement: string, ...parameters: SQLInputValue[]) {
		const preparedStatement = connection.prepare(statement);
		const rows = preparedStatement.all(...parameters);

		return rows;
	}

	async function runAsync(statement: string, ...parameters: (SQLInputValue | SQLInputValue[])[]) {
		const values = parameters.flat();
		const preparedStatement = connection.prepare(statement);
		const result = preparedStatement.run(...values);

		return result;
	}

	async function withExclusiveTransactionAsync(
		operation: (transaction: SQLiteDatabase) => Promise<void>,
	) {
		connection.exec('BEGIN IMMEDIATE;');

		try {
			await operation(database);
			connection.exec('COMMIT;');
		} catch (error) {
			connection.exec('ROLLBACK;');
			throw error;
		}
	}

	return { database, connection };
}

/**
 * Duplicate awards and partial saves can quietly change a player's balance.
 * These checks protect Ink, XP, and word progress together using real transactions.
 */
describe('saved Ink rewards', () => {
	let database: SQLiteDatabase;
	let connection: DatabaseSync;

	beforeEach(async () => {
		const openedDatabase = openTestDatabase();
		const seedStatements = `
			INSERT INTO users (id, totalXP) VALUES ('test_user', 0);
			INSERT INTO words (
				id, frenchWord, englishWords, pronunciation, ipaPronunciation,
				isVulgar, CEFR, correctCount, rarity
			)
			VALUES ('test_word', 'mot', '["word"]', 'moh', 'mo', 0, 'A1', 0, 'Common');
			INSERT INTO userWords (userId, wordId, correctCount, seenCount)
			VALUES ('test_user', 'test_word', 0, 1);
		`;

		database = openedDatabase.database;
		connection = openedDatabase.connection;
		jest.mocked(getDB).mockResolvedValue(database);

		await createTables();
		await database.execAsync(seedStatements);
	});

	afterEach(() => {
		connection.close();
		jest.restoreAllMocks();
	});

	test('returns the saved award on retry, even when the earning amount changes', async () => {
		const request = {
			database,
			userId: 'test_user',
			wordId: 'test_word',
			sessionId: 'session_one',
		};
		const firstAward = await writeCorrectAnswer(request);
		let retriedAward;
		let rewards: SavedRewards | null;

		jest.replaceProperty(inkConfig, 'correctFlashcard', 20);
		retriedAward = await writeCorrectAnswer(request);
		rewards = await database.getFirstAsync<SavedRewards>(`
			SELECT totalXP,
				(SELECT correctCount FROM userWords) AS correctCount,
				(SELECT COUNT(*) FROM flashcardAwards) AS awards
			FROM users;
		`);

		expect(firstAward.ink).toBe(1);
		expect(retriedAward).toEqual(firstAward);
		expect(await getUserInk({ database, userId: 'test_user' })).toBe(1);
		expect(rewards).toEqual({ totalXP: 10, correctCount: 1, awards: 1 });
	});

	test('rolls back Ink, XP, and word progress if saving the award fails', async () => {
		const request = {
			database,
			userId: 'test_user',
			wordId: 'test_word',
			sessionId: 'session_one',
		};
		let rewards: SavedRewards | null;

		await database.execAsync(`
			CREATE TRIGGER rejectAward BEFORE INSERT ON flashcardAwards
			BEGIN
				SELECT RAISE(ABORT, 'save failed');
			END;
		`);
		await expect(writeCorrectAnswer(request)).rejects.toThrow('save failed');
		rewards = await database.getFirstAsync<SavedRewards>(`
			SELECT totalXP,
				(SELECT correctCount FROM userWords) AS correctCount,
				(SELECT COUNT(*) FROM flashcardAwards) AS awards
			FROM users;
		`);

		expect(await getUserInk({ database, userId: 'test_user' })).toBe(0);
		expect(rewards).toEqual({ totalXP: 0, correctCount: 0, awards: 0 });

		await database.execAsync('DROP TRIGGER rejectAward;');
		await writeCorrectAnswer(request);
		expect(await getUserInk({ database, userId: 'test_user' })).toBe(1);
	});

	test('keeps session Ink separate from repeat practice and completion bonuses', async () => {
		const firstAnswer = {
			database,
			userId: 'test_user',
			wordId: 'test_word',
			sessionId: 'session_one',
		};
		const secondAnswer = { ...firstAnswer, sessionId: 'session_two' };
		const completion = {
			database,
			userId: 'test_user',
			deckId: 'test_deck',
			sessionId: 'session_one',
			correctCount: 1,
			isPerfect: true,
		};
		let receipt;
		let retriedReceipt;
		let emptyReceipt;

		await writeCorrectAnswer(firstAnswer);
		receipt = await writeDeckCompletion(completion);
		retriedReceipt = await writeDeckCompletion(completion);
		await writeCorrectAnswer(secondAnswer);
		emptyReceipt = await writeDeckCompletion({
			...completion,
			sessionId: 'session_three',
			correctCount: 0,
			isPerfect: false,
		});

		expect(receipt.earnedInk).toBe(1);
		expect(retriedReceipt).toEqual(receipt);
		expect(emptyReceipt.earnedInk).toBe(0);
		expect(await getUserInk({ database, userId: 'test_user' })).toBe(2);
	});
});
