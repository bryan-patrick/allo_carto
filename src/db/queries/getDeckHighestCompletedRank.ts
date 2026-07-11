import type { WordRankKey } from '@/src/util/wordRanks';
import { getHighestCompletedDeckRank } from '../../util/deckRankProgression';
import getDeckRankCounts from './getDeckRankCounts';

/**
 * Typing
 */
interface GetDeckHighestCompletedRankProps {
	userId: string;
	wordIds: string[];
}

/**
 * Get the highest rank the user has completed for a deck.
 */
export default async function getDeckHighestCompletedRank({
	userId,
	wordIds,
}: GetDeckHighestCompletedRankProps): Promise<WordRankKey | null> {
	const rankCounts = await getDeckRankCounts({ userId, wordIds });

	return getHighestCompletedDeckRank(rankCounts);
}
