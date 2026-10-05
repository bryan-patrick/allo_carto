import { getAtlasItemsContainingWord } from '@/src/util/atlasCompletion';
import { getCompletionPercentage } from '@/src/util/progression';
import { userExperienceConfig } from '@/src/util/userExperience';
import { getWordProgressKeyFromCounts } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';
import getDeckWordProgressCounts from './getDeckWordProgressCounts';
import { incrementCorrectCount } from './incrementCorrectCount';
import { incrementSeenCount } from './incrementSeenCount';
import updateUserProgress from './updateUserProgress';

/**
 * Award XP using the current write's database connection.
 */
async function incrementUserXP(database: SQLiteDatabase, userId: string, amount: number) {
	const result = await database.runAsync(
		'UPDATE users SET totalXP = totalXP + ? WHERE id = ?;',
		amount,
		userId,
	);

	if (result.changes !== 1) {
		throw new Error(`Could not award experience to user ${userId}.`);
	}
}

/**
 * Update the userProgress table rows affected by new word progress
 */
async function updateUserProgressTableItems({
	database,
	userId,
	wordId,
}: {
	database: SQLiteDatabase;
	userId: string;
	wordId: string;
}): Promise<void> {
	/**
	 * The atlas tells us which stories, chapters, and decks contain the word
	 */
	const atlasItems = getAtlasItemsContainingWord({
		wordId,
	});

	for (const atlasItem of atlasItems) {
		/**
		 * Recalculate this story, chapter, or deck percentage
		 * using the user's word counts in the database
		 */
		const wordProgressCounts = await getDeckWordProgressCounts({
			database,
			userId,
			wordIds: atlasItem.wordIds,
		});

		const completionPercentage = getCompletionPercentage({
			wordProgressCounts,
			wordCount: atlasItem.wordIds.length,
		});

		/**
		 * Save this percentage to the userProgress table
		 */
		await updateUserProgress({
			completionPercentage,
			database,
			id: atlasItem.id,
			type: atlasItem.type,
			userId,
		});
	}
}

/**
 * Increment a word's correctCount, award XP, and save any
 * changed deck, chapter, and story percentages
 */
export async function writeCorrectAnswer({
	database: sqliteDatabase,
	userId,
	wordId,
}: {
	database: SQLiteDatabase;
	userId: string;
	wordId: string;
}): Promise<void> {
	/**
	 * Keep the whole write together
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		/**
		 * Get the count before it changes
		 */
		const previousProgress = await database.getFirstAsync<{
			correctCount: number;
			seenCount: number;
		}>(
			`SELECT correctCount, seenCount
			FROM userWords
			WHERE userId = ? AND wordId = ?;`,
			userId,
			wordId,
		);
		const previousCorrectCount = previousProgress?.correctCount ?? 0;
		const previousSeenCount = previousProgress?.seenCount ?? 0;
		const previousWordProgress = getWordProgressKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount,
		});

		/**
		 * Save the correct answer
		 */
		await incrementCorrectCount(userId, wordId, database);

		/**
		 * Save XP with word progress so a failed write rolls back both
		 */
		await incrementUserXP(database, userId, userExperienceConfig.correctAnswerXP);

		const nextWordProgress = getWordProgressKeyFromCounts({
			correctCount: previousCorrectCount + 1,
			seenCount: previousSeenCount,
		});

		if (previousWordProgress !== nextWordProgress) {
			await updateUserProgressTableItems({
				database,
				userId,
				wordId,
			});
		}
	});
}

/**
 * Award the equivalent of five correct cards for finishing a deck
 */
export async function writeDeckCompletion({
	database,
	userId,
}: {
	database: SQLiteDatabase;
	userId: string;
}): Promise<void> {
	const bonusXP =
		userExperienceConfig.correctAnswerXP * userExperienceConfig.deckCompletionBonusCards;

	await incrementUserXP(database, userId, bonusXP);
}

/**
 * Save that a word was seen
 */
export async function writeWordSeen({
	database: sqliteDatabase,
	userId,
	wordId,
}: {
	database: SQLiteDatabase;
	userId: string;
	wordId: string;
}): Promise<void> {
	/**
	 * Seen writes use the same lock
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		/**
		 * Get the word's progress before the seenCount changes
		 */
		const previousProgress = await database.getFirstAsync<{
			correctCount: number;
			seenCount: number;
		}>(
			`SELECT correctCount, seenCount
			FROM userWords
			WHERE userId = ? AND wordId = ?;`,
			userId,
			wordId,
		);
		const previousCorrectCount = previousProgress?.correctCount ?? 0;
		const previousSeenCount = previousProgress?.seenCount ?? 0;
		const previousWordProgress = getWordProgressKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount,
		});

		await incrementSeenCount(userId, wordId, database);
		const nextWordProgress = getWordProgressKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount + 1,
		});

		if (previousWordProgress !== nextWordProgress) {
			await updateUserProgressTableItems({
				database,
				userId,
				wordId,
			});
		}
	});
}
