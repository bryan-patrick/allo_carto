import { getAtlasItemsContainingWord } from '@/src/util/atlasCompletion';
import { getCompletionPercentage } from '@/src/util/progression';
import { getWordRankKeyFromCounts } from '@/src/util/wordRanks';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDB } from '../connection';
import getDeckRankCounts from './getDeckRankCounts';
import { incrementCorrectCount } from './incrementCorrectCount';
import { incrementSeenCount } from './incrementSeenCount';
import updateUserProgress from './updateUserProgress';

/**
 * Update the userProgress table rows affected by new word progress
 * These rows belong to decks, places, and chapters
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
	 * The atlas tells us which chapters, places, and decks contain the word
	 */
	const atlasItems = getAtlasItemsContainingWord({
		wordId,
	});

	for (const atlasItem of atlasItems) {
		/**
		 * Recalculate this chapter, place, or deck percentage
		 * using the user's word counts in the database
		 */
		const rankCounts = await getDeckRankCounts({
			database,
			userId,
			wordIds: atlasItem.wordIds,
		});

		const completionPercentage = getCompletionPercentage({
			rankCounts,
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
 * Increment a word's correctCount and save any
 * changed deck, place, and chapter percentages
 */
export async function writeCorrectAnswer({
	userId,
	wordId,
}: {
	userId: string;
	wordId: string;
}): Promise<void> {
	const sqliteDatabase = await getDB();

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
		const previousRank = getWordRankKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount,
		});

		/**
		 * Save the correct answer
		 */
		await incrementCorrectCount(userId, wordId, database);

		const nextRank = getWordRankKeyFromCounts({
			correctCount: previousCorrectCount + 1,
			seenCount: previousSeenCount,
		});

		/**
		 * A changed rank changes the percentages
		 * stored in the userProgress table
		 */
		if (previousRank !== nextRank) {
			await updateUserProgressTableItems({
				database,
				userId,
				wordId,
			});
		}
	});
}

/**
 * Save that a word was seen
 */
export async function writeWordSeen({
	userId,
	wordId,
}: {
	userId: string;
	wordId: string;
}): Promise<void> {
	const sqliteDatabase = await getDB();

	/**
	 * Seen writes use the same lock
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		/**
		 * Get the word's rank before the seenCount changes
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
		const previousRank = getWordRankKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount,
		});

		await incrementSeenCount(userId, wordId, database);
		const nextRank = getWordRankKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount + 1,
		});

		/**
		 * A changed rank changes the percentages
		 * stored in the userProgress table
		 */
		if (previousRank !== nextRank) {
			await updateUserProgressTableItems({
				database,
				userId,
				wordId,
			});
		}
	});
}
