import type { WordRankKey } from '@/src/util/wordRanks';
import { getHighestSoftCompletedDeckRank } from '../../util/deckRankProgression';
import getDeckRankCounts from './getDeckRankCounts';

/**
 * Typing
 */
interface GetDeckHighestCompletedRankProps {
	userId: string;
	wordIds: string[];
}

/**
 * Get the highest rank the user has softly completed for a deck.
 */
export default async function getDeckHighestSoftCompletedRank({
	userId,
	wordIds,
}: GetDeckHighestCompletedRankProps): Promise<WordRankKey | null> {
	const rankCounts = await getDeckRankCounts({ userId, wordIds });

	return getHighestSoftCompletedDeckRank(rankCounts);
}
