import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { getCompletionPercentage } from './progression';

/**
 * Deck completion helper
 */
export function getDeckCompletionPercent({
	deckWordCount,
	wordProgressCounts,
}: {
	deckWordCount: number;
	wordProgressCounts: Pick<
		DeckWordProgressCounts,
		'new' | 'learning' | 'familiar' | 'known' | 'mastered'
	>;
}): number {
	const completionPercentage = getCompletionPercentage({
		wordCount: deckWordCount,
		wordProgressCounts,
	});

	return Math.min(100, Math.max(0, Math.floor(completionPercentage)));
}
