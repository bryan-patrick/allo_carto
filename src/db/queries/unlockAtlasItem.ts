import { isItemReadyToUnlock, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { SQLiteDatabase } from 'expo-sqlite';
import getUserExperience from './getUserExperience';
import getUserProgress from './getUserProgress';

/**
 * Typing
 */
interface UnlockAtlasItemProps {
	database: SQLiteDatabase;
	userId: string;
	/** The story, chapter, or deck ID from the atlas. */
	id: string;
}

/**
 * Save the user's choice when they press Unlock on the results screen or a locked section.
 * Check their saved progress and level again before granting permanent access.
 */
export default async function unlockAtlasItem({
	database,
	userId,
	id,
}: UnlockAtlasItemProps): Promise<boolean> {
	let didUnlock = false;

	/**
	 * Making sure we are actually able to unlock
	 */
	await database.withExclusiveTransactionAsync(async transaction => {
		const progressById = await getUserProgress({ database: transaction, userId });
		const experience = await getUserExperience({ database: transaction, userId });
		const props = { id, progressById, userLevel: experience.level };

		if (isItemUnlocked(props)) {
			didUnlock = true;
			return;
		}

		/**
		 * Keep the result false if requirements are unmet, a parent is locked, or the ID weird
		 */
		if (!isItemReadyToUnlock(props)) {
			return;
		}

		const progress = progressById[id];

		/**
		 * The progress loader includes atlas items even when they have no saved row yet.
		 * Create that row if needed. For an existing row, update only isUnlocked
		 */
		await transaction.runAsync(
			`INSERT INTO userProgress (userId, id, type, completionPercentage, isUnlocked)
			VALUES (?, ?, ?, 0, 1)
			ON CONFLICT(userId, id) DO UPDATE SET isUnlocked = 1;`,
			userId,
			id,
			progress.type,
		);

		/**
		 * The save worked. We unlocked.
		 */
		didUnlock = true;
	});

	return didUnlock;
}
