import type { CollectionRewardClaim } from '@/src/util/vocabularyCollections';
import type { SQLiteDatabase } from 'expo-sqlite';

interface GetCollectionRewardClaimsOptions {
	database: SQLiteDatabase;
	userId: string;
}

/*
 * Loads claimed collection rewards so the app remembers which XP has already been paid.
 */
export default async function getCollectionRewardClaims({
	database,
	userId,
}: GetCollectionRewardClaimsOptions): Promise<CollectionRewardClaim[]> {
	const statement = `
		SELECT collectionId, requiredWordProgress, xp, claimedAt
		FROM collectionRewardClaims
		WHERE userId = ?;
	`;

	return database.getAllAsync<CollectionRewardClaim>(statement, userId);
}
