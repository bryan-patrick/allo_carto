import { getProgressItemsForWord } from '@/src/util/atlasProgression';
import { getCompletionPercentage } from '@/src/util/progression';
import { getWordRankDefinition } from '@/src/util/wordRanks';
import { getDB } from '../connection';
import getDeckRankCounts from './getDeckRankCounts';
import { incrementCorrectCount } from './incrementCorrectCount';
import { incrementSeenCount } from './incrementSeenCount';
import updateUserProgress from './updateUserProgress';

/**
 * Typing
 */
export interface CorrectAnswerWriteResult {
	rankChanged: boolean;
}

/**
 * Save a correct answer and its progress
 */
export async function writeCorrectAnswer({
	userId,
	wordId,
}: {
	userId: string;
	wordId: string;
}): Promise<CorrectAnswerWriteResult> {
	const sqliteDatabase = await getDB();
	let rankChanged = false;

	/**
	 * Keep the whole write together
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		/**
		 * Get the count before it changes
		 */
		const previousProgress = await database.getFirstAsync<{
			correctCount: number;
		}>(
			'SELECT correctCount FROM userWords WHERE userId = ? AND wordId = ?;',
			userId,
			wordId,
		);
		const previousCorrectCount = previousProgress?.correctCount ?? 0;

		/**
		 * Save the correct answer
		 */
		await incrementCorrectCount(userId, wordId, database);

		const previousRank = getWordRankDefinition(previousCorrectCount).key;
		const nextRank = getWordRankDefinition(previousCorrectCount + 1).key;
		rankChanged = previousRank !== nextRank;

		/**
		 * Same rank means same progress
		 */
		if (!rankChanged) return;

		/**
		 * Update everything using this word
		 */
		const affectedItems = getProgressItemsForWord({ wordId });

		for (const item of affectedItems) {
			const rankCounts = await getDeckRankCounts({
				database,
				userId,
				wordIds: item.wordIds,
			});
			const completionPercentage = getCompletionPercentage({
				rankCounts,
				wordCount: item.wordIds.length,
			});

			await updateUserProgress({
				completionPercentage,
				database,
				item,
				userId,
			});
		}
	});

	return { rankChanged };
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
		await incrementSeenCount(userId, wordId, database);
	});
}
