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
 * Return the highest rank every card in a deck has completed.
 *
 * A rank is complete once every card has advanced beyond it. Diamond is the
 * highest rank and cannot be advanced beyond, so the highest possible
 * completed rank is Gold.
 */
export function getHighestCompletedDeckRank(
	rankCounts: RankCounts,
): WordRankKey | null {
	let result: WordRankKey | null = null;
	const lastCompletableRankIndex = rankKeys.length - 2;
	const deckWordCount = rankKeys.reduce((total, rankKey) => {
		return total + (rankCounts[rankKey] ?? 0);
	}, 0);

	for (
		let rankIndex = lastCompletableRankIndex;
		rankIndex >= 0 && result === null && deckWordCount > 0;
		rankIndex--
	) {
		let cardsAtOrBelowRank = 0;

		for (let i = 0; i <= rankIndex; i++) {
			cardsAtOrBelowRank += rankCounts[rankKeys[i]] ?? 0;
		}

		if (cardsAtOrBelowRank === 0) {
			result = rankKeys[rankIndex];
		}
	}

	return result;
}

/**
 * Check whether a completed deck rank satisfies another deck's prerequisite.
 */
export function doesCompletedRankMeetRequirement({
	completedRank,
	requiredRank,
}: {
	completedRank: WordRankKey | null;
	requiredRank: WordRankKey | null;
}): boolean {
	let result = false;
	const completedRankIndex = completedRank ? rankKeys.indexOf(completedRank) : -1;
	const requiredRankIndex = requiredRank ? rankKeys.indexOf(requiredRank) : -1;

	if (requiredRank === null) {
		result = true;
	}

	if (
		requiredRank !== null &&
		completedRankIndex >= requiredRankIndex &&
		requiredRankIndex >= 0
	) {
		result = true;
	}

	return result;
}

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
