import type { DeckRankCounts } from '@/src/db/queries/getDeckRankCounts';
import { getCompletionPercentage } from './progression';

/**
 * Deck completion helper
 */
export function getDeckCompletionPercent({
	deckWordCount,
	rankCounts,
}: {
	deckWordCount: number;
	rankCounts: Pick<
		DeckRankCounts,
		'bronze' | 'silver' | 'gold' | 'diamond'
	>;
}): number {
	return getCompletionPercentage({
		wordCount: deckWordCount,
		rankCounts,
	});
}
