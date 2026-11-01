import type { CardRarity, CEFR } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	DeckCompletionReceiptProps,
	WordAnswerAwardProps,
	XPBonusProps,
} from '@/src/components/CardDeck/deckSessionTypes';
import { getAtlasItemsContainingWord } from '@/src/util/atlasCompletion';
import { getMaxInkBalance, inkConfig } from '@/src/util/ink';
import { getCompletionPercentage } from '@/src/util/progression';
import {
	correctAnswerXPByRarity,
	correctAnswerXPMultiplierByCEFR,
	getUserExperience,
	userExperienceConfig,
} from '@/src/util/userExperience';
import { getWordProgressKeyFromCounts } from '@/src/util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';
import { finishFlashcardDeck, saveFlashcardResult } from './flashcardCycles';
import getDeckWordProgressCounts from './getDeckWordProgressCounts';
import getUserInk from './getUserInk';
import { incrementCorrectCount } from './incrementCorrectCount';
import { incrementSeenCount } from './incrementSeenCount';
import updateUserProgress from './updateUserProgress';

/*
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

export interface IncorrectAnswerRequest extends CorrectAnswerRequest {
	skipped: boolean;
}

interface WriteIncorrectAnswerOptions extends IncorrectAnswerRequest {
	database: SQLiteDatabase;
	userId: string;
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
	pendingInk: number;
}

interface UserXPRow {
	totalXP: number;
}

interface SavedDeckCompletionRow extends UserXPRow {
	deckId: string;
	bonuses: string;
	earnedInk: number;
}

interface SavedDeckBonusesRow {
	bonuses: string;
}

/*
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

/*
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
	/*
	 * The atlas tells us which stories, chapters, and decks contain the word
	 */
	const atlasItems = getAtlasItemsContainingWord({
		wordId,
	});

	for (const atlasItem of atlasItems) {
		/*
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

		/*
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

/*
 * Calculate the awards for a correct answer on a flashcard
 */
function getCorrectAnswerAward(previousProgress: WordProgressForAward): WordAnswerAwardProps {
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
	let learningBonusXP = 0;
	let xp: number;

	if (hasLeveledUp) {
		learningBonusXP = wordXP * userExperienceConfig.learningLevelBonusMultiplier;
	}

	xp = wordXP + learningBonusXP;

	return {
		ink: inkConfig.correctFlashcard,
		xp,
		learningBonusXP,
		previousProgress: previousWordProgress,
		nextProgress: nextWordProgress,
	};
}

/*
 * We save XP and word progress right away. The card's Ink waits for deck completion.
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

		nextAward = getCorrectAnswerAward(previousProgress);

		/*
		 * We save all parts of the answer before returning its rewards.
		 * If any part fails we rolls everything back.
		 */
		await incrementCorrectCount(userId, wordId, database);
		await incrementUserXP(database, userId, nextAward.xp);

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
		await saveFlashcardResult({
			database,
			userId,
			sessionId,
			result: {
				wordId,
				outcome: 'correct',
				...nextAward,
			},
		});

		award = nextAward;
	});

	if (!award) {
		throw new Error('Could not save the word award.');
	}

	return award;
}

/*
 * Save an incorrect or skipped answer without awarding XP or Ink.
 * Keep the result when the learner leaves and comes back to the deck.
 */
export async function writeIncorrectAnswer({
	database,
	userId,
	wordId,
	sessionId,
	skipped,
}: WriteIncorrectAnswerOptions): Promise<boolean> {
	if (!sessionId || !wordId) {
		throw new Error('An answer needs a session and word.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		await saveFlashcardResult({
			database: transaction,
			userId,
			sessionId,
			result: {
				wordId,
				outcome: skipped ? 'skipped' : 'incorrect',
				xp: 0,
				ink: 0,
			},
		});
	});

	return true;
}

/*
 * Save the deck's rewards and move to the next deck. Award the paragraph bonus after
 * the last deck, and save a receipt so the same rewards cannot be paid twice.
 */
export async function writeDeckCompletion({
	database: sqliteDatabase,
	userId,
	deckId,
	sessionId,
	correctCount,
	isPerfect,
}: WriteDeckCompletionOptions): Promise<DeckCompletionReceiptProps> {
	const statements = {
		getReceipt: `
			SELECT deckId, bonuses, totalXP, earnedInk FROM deckCompletions
			WHERE userId = ? AND sessionId = ?;
		`,
		getPendingInk: `
			SELECT COALESCE(SUM(ink), 0) AS pendingInk FROM flashcardAwards
			WHERE userId = ? AND sessionId = ?;
		`,
		getPreviousBonuses: `
			SELECT bonuses FROM deckCompletions
			WHERE userId = ? AND deckId = ?;
		`,
		getUserXP: 'SELECT totalXP FROM users WHERE id = ?;',
		addInk: `
			INSERT INTO userInk (userId, balance) VALUES (?, ?)
			ON CONFLICT(userId)
			DO UPDATE SET balance = MIN(balance + excluded.balance, ?);
		`,
		saveReceipt: `
			INSERT INTO deckCompletions (userId, sessionId, deckId, bonuses, totalXP, earnedInk)
			VALUES (?, ?, ?, ?, ?, ?);
		`,
	};
	let receipt: DeckCompletionReceiptProps | undefined;

	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		const savedReceipt = await database.getFirstAsync<SavedDeckCompletionRow>(
			statements.getReceipt,
			userId,
			sessionId,
		);
		const bonuses: XPBonusProps[] = [];
		let pendingInk = 0;
		let earnedInk = 0;

		if (savedReceipt) {
			if (savedReceipt.deckId !== deckId) {
				throw new Error('This session belongs to another deck.');
			}

			receipt = {
				bonuses: JSON.parse(savedReceipt.bonuses),
				totalXP: savedReceipt.totalXP,
				earnedInk: savedReceipt.earnedInk,
			};

			return;
		}

		// Save deck progress and rewards together so a failed save can be retried safely.
		const isParagraphComplete = await finishFlashcardDeck({
			database,
			userId,
			deckId,
			sessionId,
		});

		/*
		 * Deck rewards require a correct answer. Finishing every deck earns the paragraph
		 * bonus, even with incorrect or skipped answers.
		 */
		if (correctCount > 0) {
			// Check whether the learner has already earned a deck completion bonus.
			const previousCompletions = await database.getAllAsync<SavedDeckBonusesRow>(
				statements.getPreviousBonuses,
				userId,
				deckId,
			);
			const hasPreviousDeckReward = previousCompletions.some(completion => {
				const savedBonuses: XPBonusProps[] = JSON.parse(completion.bonuses);

				return savedBonuses.some(bonus => bonus.kind === 'completion');
			});
			const sessionInk = await database.getFirstAsync<SessionInkRow>(
				statements.getPendingInk,
				userId,
				sessionId,
			);

			pendingInk = sessionInk?.pendingInk ?? 0;
			bonuses.push({
				kind: 'completion',
				xp: userExperienceConfig.deckCompletionXP,
			});

			if (!hasPreviousDeckReward) {
				bonuses.push({
					kind: 'firstCompletion',
					xp: userExperienceConfig.firstDeckCompletionXP,
				});
			}

			if (isPerfect) {
				bonuses.push({
					kind: 'perfect',
					xp: userExperienceConfig.perfectDeckXP,
				});
			}
		}

		if (isParagraphComplete) {
			bonuses.push({
				kind: 'paragraphCompletion',
				xp: userExperienceConfig.paragraphCompletionXP,
			});
		}

		const bonusXP = bonuses.reduce((total, bonus) => total + bonus.xp, 0);

		if (bonusXP > 0) {
			await incrementUserXP(database, userId, bonusXP);
		}

		const user = await database.getFirstAsync<UserXPRow>(statements.getUserXP, userId);

		if (!user) {
			throw new Error(`Could not load XP for user ${userId}.`);
		}

		if (pendingInk > 0) {
			const experience = getUserExperience(user.totalXP);
			const maxInkBalance = getMaxInkBalance(experience.level);
			const inkBalance = await getUserInk({
				database,
				userId,
			});
			const remainingInkSpace = maxInkBalance - inkBalance;

			// Completion XP can unlock more Ink space before this reward is paid.
			earnedInk = Math.min(pendingInk, remainingInkSpace);

			if (earnedInk > 0) {
				await database.runAsync(statements.addInk, userId, earnedInk, maxInkBalance);
			}
		}

		await database.runAsync(
			statements.saveReceipt,
			userId,
			sessionId,
			deckId,
			JSON.stringify(bonuses),
			user.totalXP,
			earnedInk,
		);

		receipt = {
			bonuses,
			totalXP: user.totalXP,
			earnedInk,
		};
	});

	if (!receipt) {
		throw new Error('Could not save the completion receipt.');
	}

	return receipt;
}

/*
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
	/*
	 * Seen writes use the same lock
	 */
	await sqliteDatabase.withExclusiveTransactionAsync(async database => {
		/*
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
