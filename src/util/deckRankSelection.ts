import type { WordRankKey } from './wordRanks';
import { getWordRankKeyFromCounts } from './wordRanks';

/**
 * Give lower rank words a few more chances to be drawn.
 * Every rank needs a value above zero so every word can still be drawn.
 */
export const deckRankSelectionWeights: Record<WordRankKey, number> = {
	unseen: 1.5,
	fnew: 1.3,
	bronze: 1.15,
	silver: 1.05,
	gold: 1,
	diamond: 0.9,
};

/**
 * Get the chance increase for a word based on its current rank.
 */
export function getDeckRankSelectionWeight({
	correctCount,
	seenCount,
}: {
	correctCount: number;
	seenCount: number;
}): number {
	const rankKey = getWordRankKeyFromCounts({ correctCount, seenCount });

	return deckRankSelectionWeights[rankKey];
}
