/**
 * Typing
 */
interface DeckCompletionRankCounts {
	seen: number;
	bronze: number;
	silver: number;
	gold: number;
	diamond: number;
}

/**
 * Deck completion vars
 */
const seenCompletionWeight = 0.25;

/**
 * Deck completion helper
 */
export function getDeckCompletionPercent({
	deckWordCount,
	rankCounts,
}: {
	deckWordCount: number;
	rankCounts: DeckCompletionRankCounts;
}): number {
	if (deckWordCount === 0) return 0;

	/**
	 * This is
	 * Each card can earn four total points:
	 * bronze = 1, silver = 2, gold = 3, diamond = 4.
	 */
	const rankProgressWeight = deckWordCount * 4;
	const rankProgressCount =
		rankCounts.bronze +
		rankCounts.silver * 2 +
		rankCounts.gold * 3 +
		rankCounts.diamond * 4;
	const rankCompletion = rankProgressCount / rankProgressWeight;

	/**
	 * We want to make sure that when a user
	 * sees a card it increases progress
	 * (even though it isn't an actual value)
	 */
	const seenCompletion = rankCounts.seen / deckWordCount;
	const deckCompletion = Math.max(
		rankCompletion,
		seenCompletion * seenCompletionWeight,
	);

	return Math.round(deckCompletion * 100);
}
