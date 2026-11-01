/// <reference types="node" />

import getSolveStageProgress from '@/src/db/queries/getSolveStageProgress';
import getUserProgress from '@/src/db/queries/getUserProgress';
import createTables from '@/src/db/schema/createTables';
import resetDB from '@/src/db/resetDB';
import getTables from '@/src/db/getTables';
import { getAtlasCompletionItems } from '@/src/util/atlasCompletion';
import type { SQLiteDatabase } from 'expo-sqlite';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

let mockSqlite: DatabaseSync;

const mockDatabase = {
	execAsync: jest.fn(async (statement: string) => {
		mockSqlite.exec(statement);
	}),
	getAllAsync: jest.fn(async (statement: string, ...parameters: SQLInputValue[]) => {
		return mockSqlite.prepare(statement).all(...parameters);
	}),
	getFirstAsync: jest.fn(async (statement: string, ...parameters: SQLInputValue[]) => {
		return mockSqlite.prepare(statement).get(...parameters) ?? null;
	}),
};

const completionItems: ReturnType<typeof getAtlasCompletionItems> = [
	{
		id: 'story_one',
		type: 'story',
		wordIds: ['word_one'],
		paragraphIds: ['deck_one', 'deck_two'],
	},
	{
		id: 'chapter_one',
		type: 'chapter',
		wordIds: ['word_one'],
		paragraphIds: ['deck_one', 'deck_two'],
	},
	{
		id: 'deck_one',
		type: 'paragraph',
		wordIds: ['word_one'],
		paragraphIds: ['deck_one'],
	},
	{
		id: 'deck_two',
		type: 'paragraph',
		wordIds: ['word_one'],
		paragraphIds: ['deck_two'],
	},
	{
		id: 'empty_story',
		type: 'story',
		wordIds: [],
		paragraphIds: [],
	},
];

jest.mock('@/src/db/connection', () => ({
	getDB: jest.fn(async () => mockDatabase),
	logThisIfItFails: jest.fn(async (_message: string, operation: () => Promise<unknown>) => {
		return operation();
	}),
}));

jest.mock('@/src/db/getTables', () => jest.fn());

jest.mock('@/src/util/atlasCompletion', () => ({
	getAtlasCompletionItems: jest.fn(),
}));

describe('saved Solve progression', () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		mockSqlite = new DatabaseSync(':memory:');
		mockSqlite.exec('PRAGMA foreign_keys = ON;');
		jest.mocked(getAtlasCompletionItems).mockReturnValue(completionItems);

		await createTables();

		mockSqlite.exec(`
			INSERT INTO users (id) VALUES ('user_one'), ('user_two');
			INSERT INTO words (
				id, frenchWord, englishWords, pronunciation, ipaPronunciation,
				isVulgar, CEFR, correctCount, rarity
			) VALUES ('word_one', 'chat', '["cat"]', '', '', 0, 'A1', 0, 'Common');
			INSERT INTO userInk (userId, balance) VALUES ('user_one', 11);
		`);
	});

	afterEach(() => {
		mockSqlite.close();
	});

	test('upgrades existing first gems without changing solved cards, Ink, or the completion date', async () => {
		mockSqlite.exec(`
			ALTER TABLE solveCompletions DROP COLUMN completedSolveStages;
			INSERT INTO solveCompletions (userId, deckId, completedAt)
			VALUES ('user_one', 'deck_one', 123);
			INSERT INTO solveUnlocks (userId, deckId, position, wordId)
			VALUES ('user_one', 'deck_one', 0, 'word_one');
			INSERT INTO solvePositions (userId, deckId, position, wordId, acceptedAnswer)
			VALUES ('user_one', 'deck_one', 0, 'word_one', 'cat');
		`);

		await createTables();
		await createTables();

		const progress = await getUserProgress({
			database: mockDatabase as unknown as SQLiteDatabase,
			userId: 'user_one',
		});

		expect(progress.deck_one.completedSolveStages).toBe(1);
		expect(progress.deck_one.hasFirstGem).toBe(true);
		expect(progress.deck_two.hasFirstGem).toBe(false);
		expect(mockSqlite.prepare('SELECT completedAt FROM solveCompletions').get()).toEqual({
			completedAt: 123,
		});
		expect(mockSqlite.prepare('SELECT balance FROM userInk').get()).toEqual({
			balance: 11,
		});
		expect(mockSqlite.prepare('SELECT acceptedAnswer FROM solvePositions').get()).toEqual({
			acceptedAnswer: 'cat',
		});
		expect(mockSqlite.prepare('SELECT position FROM solveUnlocks').get()).toEqual({
			position: 0,
		});
	});

	test('loads fresh Solve+ cards independently and keeps repeated words and sentence answers separate', async () => {
		const options = {
			database: mockDatabase as unknown as SQLiteDatabase,
			userId: 'user_one',
			deckId: 'deck_one',
			stage: 2 as const,
		};

		mockSqlite.exec(`
			INSERT INTO solveUnlocks (userId, deckId, position, wordId)
			VALUES ('user_one', 'deck_one', 0, 'word_one');
		`);

		expect(await getSolveStageProgress(options)).toEqual({
			stage: 2,
			solvedPositions: [],
		});

		mockSqlite.exec(`
			INSERT INTO solveStageUnlocks (userId, deckId, stage, position, wordId)
			VALUES ('user_one', 'deck_one', 2, 0, 'word_one'),
				('user_one', 'deck_one', 2, 2, 'word_one');
			INSERT INTO solveStagePositions (userId, deckId, stage, position, wordId, acceptedAnswer)
			VALUES ('user_one', 'deck_one', 2, 0, 'word_one', 'chat'),
				('user_one', 'deck_one', 2, 2, 'word_one', 'chat'),
				('user_one', 'deck_one', 4, 0, NULL, 'A cat.'),
				('user_two', 'deck_one', 2, 0, 'word_one', 'other player'),
				('user_one', 'deck_two', 2, 0, 'word_one', 'other paragraph');
		`);

		await createTables();

		const savedWords = await getSolveStageProgress(options);
		const savedSentence = await getSolveStageProgress({
			...options,
			stage: 4,
		});

		expect(savedWords.solvedPositions).toHaveLength(2);
		expect(savedWords.solvedPositions).toEqual([
			{
				position: 0,
				wordId: 'word_one',
				acceptedAnswer: 'chat',
			},
			{
				position: 2,
				wordId: 'word_one',
				acceptedAnswer: 'chat',
			},
		]);
		expect(savedSentence.solvedPositions).toEqual([
			{
				position: 0,
				wordId: null,
				acceptedAnswer: 'A cat.',
			},
		]);
	});

	test('chapter and story stages follow their least-complete playable paragraph', async () => {
		mockSqlite.exec(`
			INSERT INTO solveCompletions (userId, deckId, completedAt, completedSolveStages)
			VALUES ('user_one', 'deck_one', 123, 5);
		`);

		const beforeSecondParagraph = await getUserProgress({
			database: mockDatabase as unknown as SQLiteDatabase,
			userId: 'user_one',
		});

		expect(beforeSecondParagraph.story_one.completedSolveStages).toBe(0);
		expect(beforeSecondParagraph.story_one.hasFirstGem).toBe(false);

		mockSqlite.exec(`
			INSERT INTO solveCompletions (userId, deckId, completedAt, completedSolveStages)
			VALUES ('user_one', 'deck_two', 124, 4);
		`);

		const progress = await getUserProgress({
			database: mockDatabase as unknown as SQLiteDatabase,
			userId: 'user_one',
		});
		const otherPlayer = await getUserProgress({
			database: mockDatabase as unknown as SQLiteDatabase,
			userId: 'user_two',
		});

		expect(progress.deck_one.completedSolveStages).toBe(5);
		expect(progress.chapter_one.completedSolveStages).toBe(4);
		expect(progress.story_one.completedSolveStages).toBe(4);
		expect(progress.story_one.hasFirstGem).toBe(true);
		expect(progress.empty_story.completedSolveStages).toBe(0);
		expect(progress.empty_story.hasFirstGem).toBe(false);
		expect(otherPlayer.story_one.completedSolveStages).toBe(0);
	});

	test('keeps later completion across startup and rejects invalid stage counts or duplicate receipts', async () => {
		const insertAttempt = mockSqlite.prepare(`
			INSERT INTO solveStageAttempts (
				userId, attemptId, deckId, stage, position, answer,
				status, acceptedAnswer, inkSpent, stageCompleted
			) VALUES ('user_one', 'attempt_one', 'deck_one', 2, 0, 'chat', 'exact', 'chat', 2, 1);
		`);

		mockSqlite.exec(`
			INSERT INTO solveCompletions (userId, deckId, completedAt, completedSolveStages)
			VALUES ('user_one', 'deck_one', 123, 4);
		`);
		insertAttempt.run();

		await createTables();

		expect(mockSqlite.prepare('SELECT completedSolveStages FROM solveCompletions').get()).toEqual({
			completedSolveStages: 4,
		});
		expect(() => insertAttempt.run()).toThrow(/UNIQUE/);
		expect(() => {
			mockSqlite.exec('UPDATE solveCompletions SET completedSolveStages = 6;');
		}).toThrow(/CHECK/);
		expect(() => {
			mockSqlite.exec('UPDATE solveCompletions SET completedSolveStages = 0;');
		}).toThrow(/CHECK/);
	});

	test('the development reset removes later-stage tables along with existing progress', async () => {
		await resetDB();

		expect(
			mockSqlite.prepare("SELECT name FROM sqlite_master WHERE name LIKE 'solve%';").all(),
		).toEqual([]);
		expect(getTables).toHaveBeenCalledTimes(1);
	});
});
