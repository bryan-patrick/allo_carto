import type { WordProgressKey } from './wordProgress';
import { getWordProgressKeyFromCounts } from './wordProgress';

/**
 * Give words in earlier progress stages a few more chances to be drawn.
 * Every stage needs a value above zero so every word can still be drawn.
 */
export const deckWordProgressSelectionWeights: Record<WordProgressKey, number> = {
	unseen: 1.5,
	new: 1.3,
	learning: 1.15,
	familiar: 1.05,
	known: 1,
	mastered: 0.9,
};

/**
 * Get the chance increase for a word based on its current progress.
 */
export function getDeckWordProgressSelectionWeight({
	correctCount,
	seenCount,
}: {
	correctCount: number;
	seenCount: number;
}): number {
	const progressKey = getWordProgressKeyFromCounts({ correctCount, seenCount });

	return deckWordProgressSelectionWeights[progressKey];
}
