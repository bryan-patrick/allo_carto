import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	DeckCompletionReceipt,
	WordAnswerAward,
	XPBonus,
} from '@/src/components/CardDeck/deckSessionTypes';
import { getAtlasItemsContainingWord } from '@/src/util/atlasCompletion';
import { getCompletionPercentage } from '@/src/util/progression';
import { correctAnswerXPByRarity, userExperienceConfig } from '@/src/util/userExperience';
import { getWordProgressKeyFromCounts } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';
import getDeckWordProgressCounts from './getDeckWordProgressCounts';
import { incrementCorrectCount } from './incrementCorrectCount';
import { incrementSeenCount } from './incrementSeenCount';
import updateUserProgress from './updateUserProgress';

export interface DeckCompletionRequest {
	deckId: string;
	sessionId: string;
	correctCount: number;
	isPerfect: boolean;
}

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
		 * Update the completion percentage
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
}): Promise<WordAnswerAward> {
	let award: WordAnswerAward | undefined;

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
			rarity: CardRarity;
		}>(
			`SELECT w.rarity,
				COALESCE(uw.correctCount, 0) AS correctCount,
				COALESCE(uw.seenCount, 0) AS seenCount
			FROM words AS w
			LEFT JOIN userWords AS uw ON uw.wordId = w.id AND uw.userId = ?
			WHERE w.id = ?;`,
			userId,
			wordId,
		);

		if (!previousProgress) throw new Error(`Could not load word ${wordId}.`);

		const wordXP = correctAnswerXPByRarity[previousProgress.rarity];
		const previousCorrectCount = previousProgress.correctCount;
		const previousSeenCount = previousProgress.seenCount;
		const previousWordProgress = getWordProgressKeyFromCounts({
			correctCount: previousCorrectCount,
			seenCount: previousSeenCount,
		});
		const nextWordProgress = getWordProgressKeyFromCounts({
			correctCount: previousCorrectCount + 1,
			seenCount: previousSeenCount,
		});
		const hasLeveledUp = previousWordProgress !== nextWordProgress;
		let learningBonusXP = 0;

		/**
		 * Leveling up a word gives 3× its rarity XP
		 */
		if (hasLeveledUp) {
			learningBonusXP = wordXP * userExperienceConfig.learningLevelBonusMultiplier;
		}

		const xp = wordXP + learningBonusXP;

		/**
		 * Save the correct answer
		 */
		await incrementCorrectCount(userId, wordId, database);

		/**
		 * Save XP with word progress so a failed write rolls back both
		 */
		await incrementUserXP(database, userId, xp);

		if (hasLeveledUp) {
			await updateUserProgressTableItems({
				database,
				userId,
				wordId,
			});
		}

		award = {
			xp,
			learningBonusXP,
			previousProgress: previousWordProgress,
			nextProgress: nextWordProgress,
		};
	});

	if (!award) throw new Error('Could not save the word award.');
	return award;
}

/**
 * Save the deck bonuses for this deck completion and return a summary for the rewards screen.
 * XP for correct words was already saved when each answer was checked.
 */
export async function writeDeckCompletion({
	database: sqliteDatabase,
	userId,
	deckId,
	sessionId,
	correctCount,
	isPerfect,
}: DeckCompletionRequest & {
	database: SQLiteDatabase;
	userId: string;
}): Promise<DeckCompletionReceipt> {
	let receipt: DeckCompletionReceipt | undefined;

	/**
	 * Save these changes together. If any step fails, none of the changes are saved.
	 * Note the receipt (above) being updated throughout the function
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		/**
		 * No correct answers means the deck does not count as complete.
		 * Return the user's current XP without adding bonuses or saving a completion.
		 * The first completion bonus stays available for a different deck completion.
		 */
		if (!correctCount) {
			const user = await database.getFirstAsync<{ totalXP: number }>(
				'SELECT totalXP FROM users WHERE id = ?;',
				userId,
			);

			if (!user) {
				throw new Error(`Could not load XP for user ${userId}.`);
			}

			receipt = { bonuses: [], totalXP: user.totalXP };

			return;
		}

		/**
		 * Check if we already saved this deck completion. Use the deck completion's
		 * ID so we don't give the same bonuses twice.
		 */
		const savedReceipt = await database.getFirstAsync<{
			deckId: string;
			bonuses: string;
			totalXP: number;
		}>(
			'SELECT deckId, bonuses, totalXP FROM deckCompletions WHERE userId = ? AND sessionId = ?;',
			userId,
			sessionId,
		);

		if (savedReceipt) {
			/**
			 * Make sure this saved deck completion belongs to the deck we are reviewing.
			 */
			if (savedReceipt.deckId !== deckId) {
				throw new Error('This session belongs to another deck.');
			}

			/**
			 * Return the saved bonuses and XP total.
			 */
			receipt = { bonuses: JSON.parse(savedReceipt.bonuses), totalXP: savedReceipt.totalXP };

			return;
		}

		/**
		 * Check if the user has completed this deck before.
		 */
		const previousCompletion = await database.getFirstAsync<{ sessionId: string }>(
			'SELECT sessionId FROM deckCompletions WHERE userId = ? AND deckId = ? LIMIT 1;',
			userId,
			deckId,
		);

		/**
		 * Start with the bonus given for each deck completion.
		 */
		const bonuses: XPBonus[] = [{ kind: 'completion', xp: userExperienceConfig.deckCompletionXP }];

		/**
		 * Add another bonus if this is the user's first time completing this deck.
		 */
		if (!previousCompletion) {
			bonuses.push({ kind: 'firstCompletion', xp: userExperienceConfig.firstDeckCompletionXP });
		}

		/**
		 * Add the perfect deck bonus if every word was correct.
		 * This bonus can be earned again on later deck completions.
		 */
		if (isPerfect) {
			bonuses.push({ kind: 'perfect', xp: userExperienceConfig.perfectDeckXP });
		}

		/**
		 * Add up the deck bonuses. Leave out word XP and learning level bonuses
		 * because they were already given when the user answered each word.
		 */
		const bonusXP = bonuses.reduce((total, bonus) => total + bonus.xp, 0);

		/**
		 * Add the deck bonuses to the user's saved XP.
		 */
		await incrementUserXP(database, userId, bonusXP);

		/**
		 * Read the user's new XP total so the rewards screen shows the saved amount.
		 */
		const user = await database.getFirstAsync<{ totalXP: number }>(
			'SELECT totalXP FROM users WHERE id = ?;',
			userId,
		);

		if (!user) {
			throw new Error(`Could not load XP for user ${userId}.`);
		}

		/**
		 * Save this deck completion's bonuses and new XP total under the deck completion's ID.
		 * If we are asked about this deck completion again, return this saved summary.
		 */
		await database.runAsync(
			'INSERT INTO deckCompletions (userId, sessionId, deckId, bonuses, totalXP) VALUES (?, ?, ?, ?, ?);',
			userId,
			sessionId,
			deckId,
			JSON.stringify(bonuses),
			user.totalXP,
		);
		receipt = { bonuses, totalXP: user.totalXP };
	});

	/**
	 * Stop if no reward summary was made. Otherwise, return it to the caller.
	 */
	if (!receipt) {
		throw new Error('Could not save the completion receipt.');
	}

	return receipt;
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
