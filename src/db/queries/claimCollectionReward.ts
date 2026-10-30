import { collectionAtlas, type CollectionRewardLevel } from '@/data/french/collectionAtlas';
import {
	getVocabularyCollectionProgress,
	type CollectionRewardClaim,
} from '@/src/util/vocabularyCollections';
import type { SQLiteDatabase } from 'expo-sqlite';
import getUserWordProgress from './getUserWordProgress';

export interface ClaimCollectionRewardRequest {
	collectionId: string;
	requiredWordProgress: CollectionRewardLevel;
}

interface ClaimCollectionRewardOptions extends ClaimCollectionRewardRequest {
	database: SQLiteDatabase;
	userId: string;
}

export interface CollectionRewardReceipt {
	status: 'claimed' | 'alreadyClaimed' | 'notReady';
	xp: number;
}

/*
 * Saves an eligible collection reward and its XP together to prevent duplicate payouts.
 */
export default async function claimCollectionReward({
	database,
	userId,
	collectionId,
	requiredWordProgress,
}: ClaimCollectionRewardOptions): Promise<CollectionRewardReceipt> {
	const statements = {
		getClaim: `
			SELECT collectionId, requiredWordProgress, xp, claimedAt
			FROM collectionRewardClaims
			WHERE userId = ? AND collectionId = ? AND requiredWordProgress = ?;
		`,
		addXP: 'UPDATE users SET totalXP = totalXP + ? WHERE id = ?;',
		saveClaim: `
			INSERT INTO collectionRewardClaims (
				userId, collectionId, requiredWordProgress, xp, claimedAt
			)
			VALUES (?, ?, ?, ?, ?);
		`,
	};
	const collection = collectionAtlas.collections.find(entry => entry.id === collectionId);
	let receipt: CollectionRewardReceipt = {
		status: 'notReady',
		xp: 0,
	};

	if (!collection) {
		throw new Error(`Collection ${collectionId} does not exist.`);
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const savedClaim = await transaction.getFirstAsync<CollectionRewardClaim>(
			statements.getClaim,
			userId,
			collectionId,
			requiredWordProgress,
		);

		if (savedClaim) {
			receipt = {
				status: 'alreadyClaimed',
				xp: savedClaim.xp,
			};
			return;
		}

		const wordProgressById = await getUserWordProgress({
			database: transaction,
			userId,
		});
		const progress = getVocabularyCollectionProgress({
			collection,
			wordProgressById,
			claims: [],
		});
		const reward = progress.rewards.find(
			entry => entry.requiredWordProgress === requiredWordProgress,
		);

		if (!reward?.isEligible) {
			return;
		}

		const award = await transaction.runAsync(statements.addXP, reward.xp, userId);

		if (award.changes !== 1) {
			throw new Error('Could not save the collection XP reward.');
		}

		await transaction.runAsync(
			statements.saveClaim,
			userId,
			collectionId,
			requiredWordProgress,
			reward.xp,
			Date.now(),
		);

		receipt = {
			status: 'claimed',
			xp: reward.xp,
		};
	});

	return receipt;
}
