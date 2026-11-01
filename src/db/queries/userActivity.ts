import { collectionAtlas } from '@/data/french/collectionAtlas';
import { getAtlasCompletionItems, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getMaxInkBalance } from '@/src/util/ink';
import type { ProgressById, ProgressType } from '@/src/util/progression';
import { getCompletedSolveStages, type SolveStage } from '@/src/util/solveProgression';
import {
	getActivityItemLabel,
	isUserNotificationType,
	userActivityLimit,
	type UserActivity,
	type UserActivityType,
} from '@/src/util/userActivity';
import { getUserExperience } from '@/src/util/userExperience';
import type { SQLiteDatabase } from 'expo-sqlite';
import getUserProgress from './getUserProgress';
import { saveUserNotification } from './userNotifications';

interface UserActivityOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface SaveUserActivityOptions extends UserActivityOptions {
	type: UserActivityType;
	description: string;
}

interface RecordXPActivityOptions extends UserActivityOptions {
	xp: number;
	source?: string;
	isClaim?: boolean;
}

interface UserXPRow {
	totalXP: number;
}

interface RecordSolveProgressActivityOptions extends UserActivityOptions {
	previousProgress: ProgressById;
}

interface RecordStampUnlockActivityOptions extends UserActivityOptions {
	wordId: string;
}

interface StampWordRow {
	frenchWord: string;
}

const unlockActivityTypes: Record<ProgressType, UserActivityType> = {
	story: 'storyUnlocked',
	chapter: 'chapterUnlocked',
	paragraph: 'paragraphUnlocked',
};

const statements = {
	getActivity: `
		SELECT id, type, description, createdAt FROM userActivity
		WHERE userId = ? AND type NOT IN ('xpEarned', 'deckCompleted')
		ORDER BY id DESC LIMIT ?;
	`,
	saveActivity: `
		INSERT INTO userActivity (userId, type, description, createdAt)
		VALUES (?, ?, ?, ?);
	`,
	removeOldActivity: `
		DELETE FROM userActivity WHERE userId = ? AND id IN (
			SELECT id FROM userActivity WHERE userId = ?
			ORDER BY id DESC LIMIT -1 OFFSET ?
		);
	`,
	getUserXP: 'SELECT totalXP FROM users WHERE id = ?;',
	getStampWord: 'SELECT frenchWord FROM words WHERE id = ?;',
};

// Load the player's latest activity with the newest entries first.
export async function getUserActivity({
	database,
	userId,
}: UserActivityOptions): Promise<UserActivity[]> {
	return database.getAllAsync<UserActivity>(statements.getActivity, userId, userActivityLimit);
}

/*
 * Save activity and any notification alongside the progress change that caused them.
 * Keep the latest 50 activity entries and leave notifications until they are dismissed.
 */
export async function saveUserActivity({
	database,
	userId,
	type,
	description,
}: SaveUserActivityOptions): Promise<void> {
	const createdAt = Date.now();

	await database.runAsync(statements.saveActivity, userId, type, description, createdAt);

	if (isUserNotificationType(type)) {
		await saveUserNotification({
			database,
			userId,
			type,
			description,
			createdAt,
		});
	}

	await database.runAsync(statements.removeOldActivity, userId, userId, userActivityLimit);
}

// Record a newly revealed stamp with its word and collection name.
export async function recordStampUnlockActivity({
	database,
	userId,
	wordId,
}: RecordStampUnlockActivityOptions): Promise<void> {
	const collection = collectionAtlas.collections.find(entry => {
		return entry.words.some(word => word.wordId === wordId);
	});

	if (!collection) {
		return;
	}

	const word = await database.getFirstAsync<StampWordRow>(statements.getStampWord, wordId);

	if (!word) {
		throw new Error('Could not load the word for its new stamp.');
	}

	await saveUserActivity({
		database,
		userId,
		type: 'stampUnlocked',
		description: `${word.frenchWord} · ${collection.name}`,
	});
}

/*
 * Record XP claims and any levels or extra Ink space earned from XP.
 * Automatic XP rewards only add entries when they raise the player's level.
 */
export async function recordXPActivity({
	database,
	userId,
	xp,
	source,
	isClaim = false,
}: RecordXPActivityOptions): Promise<void> {
	const user = await database.getFirstAsync<UserXPRow>(statements.getUserXP, userId);

	if (!user) {
		throw new Error('Could not load the player for their XP activity.');
	}

	const previousExperience = getUserExperience(user.totalXP - xp);
	const nextExperience = getUserExperience(user.totalXP);
	const previousInkCapacity = getMaxInkBalance(previousExperience.level);
	const nextInkCapacity = getMaxInkBalance(nextExperience.level);

	if (isClaim && source) {
		await saveUserActivity({
			database,
			userId,
			type: 'xpClaimed',
			description: `+${xp.toLocaleString()} XP · ${source}`,
		});
	}

	for (let level = previousExperience.level + 1; level <= nextExperience.level; level++) {
		await saveUserActivity({
			database,
			userId,
			type: 'levelUp',
			description: `You reached level ${level}.`,
		});
	}

	if (nextInkCapacity > previousInkCapacity) {
		await saveUserActivity({
			database,
			userId,
			type: 'inkCapacityIncreased',
			description: `Your maximum Ink increased from ${previousInkCapacity} to ${nextInkCapacity}.`,
		});
	}
}

// Build the gem message for each completed Solve stage.
function getGemActivityDescriptions(label: string): Record<SolveStage, string> {
	return {
		1: `First gem · ${label}`,
		2: `Second gem · ${label}`,
		3: `Third gem · ${label}`,
		4: `Your three gems are now glowing · ${label}`,
		5: `Your three gems are now prismatic · ${label}`,
	};
}

/*
 * Record earned gems and newly opened stories, chapters, or paragraphs after a gem claim.
 * Completing the fifth stage also records the paragraph's full Solve completion.
 */
export async function recordSolveProgressActivity({
	database,
	userId,
	previousProgress,
}: RecordSolveProgressActivityOptions): Promise<void> {
	const nextProgress = await getUserProgress({
		database,
		userId,
	});
	const items = getAtlasCompletionItems();

	for (const item of items) {
		const previousStages = getCompletedSolveStages(previousProgress[item.id]);
		const nextStages = getCompletedSolveStages(nextProgress[item.id]);
		const label = getActivityItemLabel(item.id);
		const gemDescriptions = getGemActivityDescriptions(label);
		const wasUnlocked = isItemUnlocked({
			id: item.id,
			progressById: previousProgress,
		});
		const isUnlocked = isItemUnlocked({
			id: item.id,
			progressById: nextProgress,
		});

		if (nextStages > previousStages && nextStages !== 0) {
			await saveUserActivity({
				database,
				userId,
				type: nextStages > 3 ? 'gemsUpgraded' : 'gemEarned',
				description: gemDescriptions[nextStages],
			});

			if (item.type === 'paragraph' && nextStages === 5) {
				await saveUserActivity({
					database,
					userId,
					type: 'paragraphSolveCompleted',
					description: label,
				});
			}
		}

		if (!wasUnlocked && isUnlocked) {
			await saveUserActivity({
				database,
				userId,
				type: unlockActivityTypes[item.type],
				description: label,
			});
		}
	}
}
