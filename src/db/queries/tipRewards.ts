import { getTipById } from '@/data/french/tips';
import { userExperienceConfig } from '@/src/util/userExperience';
import type { SQLiteDatabase } from 'expo-sqlite';
import { runDatabaseTransaction } from '../runDatabaseTransaction';
import { recordXPActivity } from './userActivity';
import type { TipDiscovery } from './tipDiscoveries';

/**
 * Typing
 */
interface TipRewardOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface ClaimTipRewardOptions extends TipRewardOptions {
	tipId: string;
}

export interface TipRewardClaim {
	tipId: string;
	xp: number;
	claimedAt: number;
}

export interface TipRewardReceipt {
	status: 'claimed' | 'alreadyClaimed';
	xp: number;
}

const statements = {
	getClaims: `
		SELECT tipId, xp, claimedAt FROM tipRewardClaims
		WHERE userId = ?;
	`,
	getClaim: `
		SELECT tipId, xp, claimedAt FROM tipRewardClaims
		WHERE userId = ? AND tipId = ?;
	`,
	getDiscovery: `
		SELECT tipId, discoveredAt FROM userTipDiscoveries
		WHERE userId = ? AND tipId = ?;
	`,
	addXP: 'UPDATE users SET totalXP = totalXP + ? WHERE id = ?;',
	saveClaim: `
		INSERT INTO tipRewardClaims (userId, tipId, xp, claimedAt)
		VALUES (?, ?, ?, ?);
	`,
};

/**
 * Loads the tips whose XP the player has already claimed.
 */
export async function getTipRewardClaims({
	database,
	userId,
}: TipRewardOptions): Promise<TipRewardClaim[]> {
	return database.getAllAsync<TipRewardClaim>(statements.getClaims, userId);
}

/**
 * Saves a tip's claim and its XP together so each player can earn it only once.
 */
export async function claimTipReward({
	database,
	userId,
	tipId,
}: ClaimTipRewardOptions): Promise<TipRewardReceipt> {
	const tip = getTipById(tipId);
	const xp = userExperienceConfig.tipXP;
	let receipt: TipRewardReceipt = {
		status: 'alreadyClaimed',
		xp: 0,
	};

	if (!tip) {
		throw new Error(`Tip ${tipId} does not exist.`);
	}

	await runDatabaseTransaction(database, async transaction => {
		const savedClaim = await transaction.getFirstAsync<TipRewardClaim>(
			statements.getClaim,
			userId,
			tipId,
		);

		if (savedClaim) {
			receipt = {
				status: 'alreadyClaimed',
				xp: savedClaim.xp,
			};
			return;
		}

		const discovery = await transaction.getFirstAsync<TipDiscovery>(
			statements.getDiscovery,
			userId,
			tipId,
		);

		if (!discovery) {
			throw new Error('Open this tip before claiming its XP.');
		}

		const award = await transaction.runAsync(statements.addXP, xp, userId);

		if (award.changes !== 1) {
			throw new Error('Could not save the tip XP reward.');
		}

		await transaction.runAsync(statements.saveClaim, userId, tipId, xp, Date.now());
		await recordXPActivity({
			database: transaction,
			userId,
			xp,
			source: `${tip.title} · French tip`,
			isClaim: true,
		});

		receipt = {
			status: 'claimed',
			xp,
		};
	});

	return receipt;
}
