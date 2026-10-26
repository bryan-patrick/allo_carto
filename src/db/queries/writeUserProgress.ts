import type { CardRarity, CEFR } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	DeckCompletionReceiptProps,
	WordAnswerAwardProps,
	XPBonusProps,
} from '@/src/components/CardDeck/deckSessionTypes';
import { getAtlasItemsContainingWord } from '@/src/util/atlasCompletion';
import { inkConfig } from '@/src/util/ink';
import getUserInk from './getUserInk';
import { getCompletionPercentage } from '@/src/util/progression';
import {
	correctAnswerXPByRarity,
	correctAnswerXPMultiplierByCEFR,
	userExperienceConfig,
} from '@/src/util/userExperience';
import { getWordProgressKeyFromCounts } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';
import getDeckWordProgressCounts from './getDeckWordProgressCounts';
import { incrementCorrectCount } from './incrementCorrectCount';
import { incrementSeenCount } from './incrementSeenCount';
import updateUserProgress from './updateUserProgress';

/**
 * Typing
 */
export interface DeckCompletionRequest {
	deckId: string;
	sessionId: string;
	correctCount: number;
	isPerfect: boolean;
}

export interface CorrectAnswerRequest {
	wordId: string;
	sessionId: string;
}

interface WriteCorrectAnswerOptions extends CorrectAnswerRequest {
	database: SQLiteDatabase;
	userId: string;
}

interface WriteDeckCompletionOptions extends DeckCompletionRequest {
	database: SQLiteDatabase;
	userId: string;
}

interface WordProgressForAward {
	correctCount: number;
	seenCount: number;
	rarity: CardRarity;
	CEFR: CEFR;
}

interface SessionInkRow {
	earnedInk: number;
}

interface UserXPRow {
	totalXP: number;
}

interface SavedDeckCompletionRow extends UserXPRow {
	deckId: string;
	bonuses: string;
}

interface SavedDeckSessionRow {
	sessionId: string;
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
 * Calculate the awards for a correct answer on a flashcard
 */
function getCorrectAnswerAward(
	previousProgress: WordProgressForAward,
	inkBalance: number,
): WordAnswerAwardProps {
	const rarityXP = correctAnswerXPByRarity[previousProgress.rarity];
	const cefrMultiplier = correctAnswerXPMultiplierByCEFR[previousProgress.CEFR];
	const wordXP = rarityXP * cefrMultiplier;
	const nextCorrectCount = previousProgress.correctCount + 1;
	const previousWordProgress = getWordProgressKeyFromCounts(previousProgress);
	const nextWordProgress = getWordProgressKeyFromCounts({
		correctCount: nextCorrectCount,
		seenCount: previousProgress.seenCount,
	});
	const hasLeveledUp = previousWordProgress !== nextWordProgress;
	const remainingInkSpace = inkConfig.maxBalance - inkBalance;
	const ink = Math.min(inkConfig.correctFlashcard, remainingInkSpace);
	let learningBonusXP = 0;
	let xp: number;

	if (hasLeveledUp) {
		learningBonusXP = wordXP * userExperienceConfig.learningLevelBonusMultiplier;
	}

	xp = wordXP + learningBonusXP;

	return {
		ink,
		xp,
		learningBonusXP,
		previousProgress: previousWordProgress,
		nextProgress: nextWordProgress,
	};
}

/**
 * We save the word's progress, XP, and Ink together
 */
export async function writeCorrectAnswer({
	database: sqliteDatabase,
	userId,
	wordId,
	sessionId,
}: WriteCorrectAnswerOptions): Promise<WordAnswerAwardProps> {
	const statements = {
		getSavedAward: `
			SELECT xp, learningBonusXP, previousProgress, nextProgress, ink
			FROM flashcardAwards
			WHERE userId = ? AND sessionId = ? AND wordId = ?;
		`,
		getWordProgress: `
			SELECT w.rarity, w.CEFR,
				COALESCE(uw.correctCount, 0) AS correctCount,
				COALESCE(uw.seenCount, 0) AS seenCount
			FROM words AS w
			LEFT JOIN userWords AS uw ON uw.wordId = w.id AND uw.userId = ?
			WHERE w.id = ?;
		`,
		addInk: `
			INSERT INTO userInk (userId, balance)
			VALUES (?, ?)
			ON CONFLICT(userId)
			DO UPDATE SET balance = MIN(balance + excluded.balance, ?);
		`,
		saveAward: `
			INSERT INTO flashcardAwards (
				userId, sessionId, wordId, xp, learningBonusXP,
				previousProgress, nextProgress, ink
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?);
		`,
	};

	let award: WordAnswerAwardProps | undefined;

	if (!sessionId || !wordId) {
		throw new Error('A correct answer needs a session and word.');
	}

	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		const savedAward = await database.getFirstAsync<WordAnswerAwardProps>(
			statements.getSavedAward,
			userId,
			sessionId,
			wordId,
		);

		let previousProgress: WordProgressForAward | null;
		let nextAward: WordAnswerAwardProps;
		let inkBalance: number;

		if (savedAward) {
			award = savedAward;
			return;
		}

		previousProgress = await database.getFirstAsync<WordProgressForAward>(
			statements.getWordProgress,
			userId,
			wordId,
		);

		if (!previousProgress) {
			throw new Error(`Could not load word ${wordId}.`);
		}

		/**
		 * We only award the Ink that still fits. XP and word progress keep growing
		 * when the bottle is full, and the receipt records the amount actually added.
		 */
		inkBalance = await getUserInk({ database, userId });
		nextAward = getCorrectAnswerAward(previousProgress, inkBalance);

		/**
		 * We save all parts of the answer before returning its rewards.
		 * If any part fails we rolls everything back.
		 */
		await incrementCorrectCount(userId, wordId, database);
		await incrementUserXP(database, userId, nextAward.xp);
		await database.runAsync(statements.addInk, userId, nextAward.ink, inkConfig.maxBalance);

		if (nextAward.previousProgress !== nextAward.nextProgress) {
			await updateUserProgressTableItems({ database, userId, wordId });
		}

		await database.runAsync(
			statements.saveAward,
			userId,
			sessionId,
			wordId,
			nextAward.xp,
			nextAward.learningBonusXP,
			nextAward.previousProgress,
			nextAward.nextProgress,
			nextAward.ink,
		);

		award = nextAward;
	});

	if (!award) {
		throw new Error('Could not save the word award.');
	}

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
}: WriteDeckCompletionOptions): Promise<DeckCompletionReceiptProps> {
	const sessionInkStatement = `
		SELECT COALESCE(SUM(ink), 0) AS earnedInk
		FROM flashcardAwards
		WHERE userId = ? AND sessionId = ?;
	`;

	let receipt: DeckCompletionReceiptProps | undefined;

	/**
	 * Save these changes together. If any step fails, none of the changes are saved.
	 * Note the receipt (above) being updated throughout the function
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		const sessionInk = await database.getFirstAsync<SessionInkRow>(
			sessionInkStatement,
			userId,
			sessionId,
		);
		const earnedInk = sessionInk?.earnedInk ?? 0;

		/**
		 * No correct answers means there are no completion bonuses.
		 */
		if (!correctCount) {
			const user = await database.getFirstAsync<UserXPRow>(
				'SELECT totalXP FROM users WHERE id = ?;',
				userId,
			);

			if (!user) {
				throw new Error(`Could not load XP for user ${userId}.`);
			}

			receipt = { bonuses: [], totalXP: user.totalXP, earnedInk };

			return;
		}

		/**
		 * Check if we already saved this deck completion. Use the deck completion's
		 * ID so we don't give the same bonuses twice.
		 */
		const savedReceipt = await database.getFirstAsync<SavedDeckCompletionRow>(
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
			receipt = {
				bonuses: JSON.parse(savedReceipt.bonuses),
				totalXP: savedReceipt.totalXP,
				earnedInk,
			};

			return;
		}

		/**
		 * Check if the user has completed this deck before.
		 */
		const previousCompletion = await database.getFirstAsync<SavedDeckSessionRow>(
			'SELECT sessionId FROM deckCompletions WHERE userId = ? AND deckId = ? LIMIT 1;',
			userId,
			deckId,
		);

		/**
		 * Start with the bonus given for each deck completion.
		 */
		const bonuses: XPBonusProps[] = [
			{ kind: 'completion', xp: userExperienceConfig.deckCompletionXP },
		];

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
		const user = await database.getFirstAsync<UserXPRow>(
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
		receipt = { bonuses, totalXP: user.totalXP, earnedInk };
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
	deckId,
}: {
	database: SQLiteDatabase;
	userId: string;
	wordId: string;
	deckId?: string;
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

		if (deckId) {
			await database.runAsync(
				`INSERT INTO userProgress (userId, id, type, completionPercentage, hasStartedFlashcards)
				VALUES (?, ?, 'paragraph', 0, 1)
				ON CONFLICT(userId, id) DO UPDATE SET hasStartedFlashcards = 1;`,
				userId,
				deckId,
			);
		}
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
