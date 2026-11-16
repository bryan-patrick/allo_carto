import { getTipById } from '@/data/french/tips';
import type { SQLiteDatabase } from 'expo-sqlite';
import { runDatabaseTransaction } from '../runDatabaseTransaction';

/**
 * Typing
 */
interface TipDiscoveryOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface SaveTipDiscoveryOptions extends TipDiscoveryOptions {
	tipId: string;
}

export interface TipDiscovery {
	tipId: string;
	discoveredAt: number;
}

const statements = {
	getDiscoveries: `
		SELECT tipId, discoveredAt FROM userTipDiscoveries
		WHERE userId = ?;
	`,
	saveDiscovery: `
		INSERT INTO userTipDiscoveries (userId, tipId, discoveredAt)
		VALUES (?, ?, ?)
		ON CONFLICT(userId, tipId) DO NOTHING;
	`,
};

/**
 * Loads the tips the player has already opened.
 */
export async function getTipDiscoveries({
	database,
	userId,
}: TipDiscoveryOptions): Promise<TipDiscovery[]> {
	return database.getAllAsync<TipDiscovery>(statements.getDiscoveries, userId);
}

/**
 * Saves the first time the player opens a tip.
 */
export async function saveTipDiscovery({
	database,
	userId,
	tipId,
}: SaveTipDiscoveryOptions): Promise<void> {
	const tip = getTipById(tipId);
	const discoveredAt = Date.now();

	if (!tip) {
		throw new Error(`Tip ${tipId} does not exist.`);
	}

	await runDatabaseTransaction(database, async transaction => {
		await transaction.runAsync(statements.saveDiscovery, userId, tipId, discoveredAt);
	});
}
