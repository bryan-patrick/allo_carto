import type { WordProgressKey } from './wordProgress';
import { getWordProgressKeyFromCounts } from './wordProgress';

/*
 * We give unseen flashcards a much bigger chance to appear during practice.
 * Rarity still affects the draw, and seen words keep a chance to appear too.
 */
export const deckWordProgressSelectionWeights: Record<WordProgressKey, number> = {
	unseen: 10,
	new: 1.3,
	learning: 1.15,
	familiar: 1.05,
	known: 1,
	mastered: 0.9,
};

interface DeckWordProgressSelectionCounts {
	correctCount: number;
	seenCount: number;
}

/*
 * Get the chance increase for a word based on its current progress.
 */
export function getDeckWordProgressSelectionWeight({
	correctCount,
	seenCount,
}: DeckWordProgressSelectionCounts): number {
	const progressKey = getWordProgressKeyFromCounts({ correctCount, seenCount });

	return deckWordProgressSelectionWeights[progressKey];
}
