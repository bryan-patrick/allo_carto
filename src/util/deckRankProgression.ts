import type { WordRankKey } from './wordRanks';
import { wordRankDefinitions } from './wordRanks';

/**
 * Typing
 */
type RankCounts = Record<WordRankKey, number>;
export type DeckRankSelectionState = 'available' | 'complete' | 'locked';

/**
 * Rank progression vars
 */
const rankKeys = wordRankDefinitions.map(({ key }) => key);

/**
 * Deck rank progression
 */
export function getDeckRankSelectionState({
	deckWordCount,
	rankCounts,
	rankKey,
}: {
	deckWordCount: number;
	rankCounts: RankCounts;
	rankKey: WordRankKey;
}): DeckRankSelectionState {
	/**
	 * A rank button can be:
	 * - available: the user can select it
	 * - complete: there are no cards left
	 * - locked: the user needs to finish an earlier rank first
	 */
	let result: DeckRankSelectionState = 'locked';
	let totalCardsAfterThisRank: number = 0;
	const rankIndex: number = rankKeys.findIndex(key => key === rankKey);
	const rankCount: number = rankCounts[rankKey] ?? 0;
	const diamondCount: number = rankCounts.diamond ?? 0;
	const earliestRankWithCardsIndex: number = rankKeys.findIndex(key => {
		return (rankCounts[key] ?? 0) > 0;
	});

	/**
	 * Start at current rank and add up all the cards after
	 */
	for (let i = rankIndex + 1; i < rankKeys.length; i++) {
		const key = rankKeys[i];
		totalCardsAfterThisRank += rankCounts[key] ?? 0;
	}

	/**
	 * Diamond is the last rank.
	 * It only unlocks when every card is already diamond.
	 */
	if (rankKey === 'diamond') {
		if (deckWordCount > 0 && diamondCount === deckWordCount) {
			result = 'available';
		}
	}

	/**
	 * Empty ranks can mean two things.
	 * 1. It is fully completed or 2. It hasn't been touched yet.
	 *
	 * If cards exist after this rank, then this rank was cleared
	 * and should show the checkmark.
	 *
	 * If no cards exist after this rank, then the user has not
	 * reached this rank yet, so keep it locked.
	 */
	if (rankKey !== 'diamond' && rankCount === 0 && totalCardsAfterThisRank > 0) {
		result = 'complete';
	}

	/**
	 * Only let the user work on the earliest rank
	 * that still has cards in it.
	 */
	if (
		rankKey !== 'diamond' &&
		rankCount > 0 &&
		rankIndex === earliestRankWithCardsIndex
	) {
		result = 'available';
	}

	return result;
}
