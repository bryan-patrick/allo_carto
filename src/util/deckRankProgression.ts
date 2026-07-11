import type { WordRankKey } from './wordRanks';
import { wordRankDefinitions } from './wordRanks';

/**
 * Typing
 */
type RankCounts = Record<WordRankKey, number>;

export type DeckRankCompletion = 'incomplete' | 'soft' | 'full';

export interface DeckRankProgress {
	completion: DeckRankCompletion;
	isSelectable: boolean;
	isUnlocked: boolean;
	progressCount: number;
	unlockCount: number;
}

const rankKeys = wordRankDefinitions.map(({ key }) => key);

/**
 * Get the number of cards needed to unlock the next rank.
 */
export function getDeckRankUnlockCount(deckWordCount: number): number {
	return Math.ceil(Math.max(deckWordCount, 0) / 2);
}

function getCardsAfterRank(rankCounts: RankCounts, rankIndex: number): number {
	let result = 0;

	for (let index = rankIndex + 1; index < rankKeys.length; index++) {
		result += rankCounts[rankKeys[index]] ?? 0;
	}

	return result;
}

/**
 * Get the highest softly completed rank in a deck.
 *
 * A rank is softly complete once at least half the deck has advanced beyond
 * it. Diamond has no following rank, so reaching Diamond counts as its
 * progress instead. Soft completion is used for deck prerequisites.
 */
export function getHighestSoftCompletedDeckRank(
	rankCounts: RankCounts,
): WordRankKey | null {
	const deckWordCount = rankKeys.reduce((total, rankKey) => {
		return total + (rankCounts[rankKey] ?? 0);
	}, 0);
	const unlockCount = getDeckRankUnlockCount(deckWordCount);

	for (let rankIndex = rankKeys.length - 1; rankIndex >= 0; rankIndex--) {
		const progressCount =
			rankKeys[rankIndex] === 'diamond' ?
				(rankCounts.diamond ?? 0)
			:	getCardsAfterRank(rankCounts, rankIndex);

		if (deckWordCount > 0 && progressCount >= unlockCount) {
			return rankKeys[rankIndex];
		}
	}

	return null;
}

/**
 * Return the highest rank every card in a deck has fully completed.
 */
export function getHighestFullyCompletedDeckRank(
	rankCounts: RankCounts,
): WordRankKey | null {
	const deckWordCount = rankKeys.reduce((total, rankKey) => {
		return total + (rankCounts[rankKey] ?? 0);
	}, 0);

	for (let rankIndex = rankKeys.length - 1; rankIndex >= 0; rankIndex--) {
		const progressCount =
			rankKeys[rankIndex] === 'diamond' ?
				(rankCounts.diamond ?? 0)
			:	getCardsAfterRank(rankCounts, rankIndex);

		if (deckWordCount > 0 && progressCount === deckWordCount) {
			return rankKeys[rankIndex];
		}
	}

	return null;
}

/**
 * Check if the user's rank progress is enough to unlock the next deck.
 */
export function doesCompletedRankMeetRequirement({
	completedRank,
	requiredRank,
}: {
	completedRank: WordRankKey | null;
	requiredRank: WordRankKey | null;
}): boolean {
	if (requiredRank === null) return true;

	const completedRankIndex =
		completedRank ? rankKeys.indexOf(completedRank) : -1;
	const requiredRankIndex = rankKeys.indexOf(requiredRank);

	return requiredRankIndex >= 0 && completedRankIndex >= requiredRankIndex;
}

/**
 * Check the user's progress for one rank.
 * A rank can still be played after it is soft complete if it has cards left.
 */
export function getDeckRankProgress({
	deckWordCount,
	rankCounts,
	rankKey,
}: {
	deckWordCount: number;
	rankCounts: RankCounts;
	rankKey: WordRankKey;
}): DeckRankProgress {
	const rankIndex = rankKeys.indexOf(rankKey);
	const rankCount = rankCounts[rankKey] ?? 0;
	const unlockCount = getDeckRankUnlockCount(deckWordCount);
	const cardsAfterRank = getCardsAfterRank(rankCounts, rankIndex);
	const cardsAtOrAboveRank = rankCount + cardsAfterRank;
	const progressCount =
		rankKey === 'diamond' ? cardsAtOrAboveRank : cardsAfterRank;
	const isUnlocked =
		deckWordCount > 0 && (rankIndex === 0 || cardsAtOrAboveRank >= unlockCount);

	let completion: DeckRankCompletion = 'incomplete';

	if (deckWordCount > 0 && progressCount === deckWordCount) {
		completion = 'full';
	} else if (deckWordCount > 0 && progressCount >= unlockCount) {
		completion = 'soft';
	}

	return {
		completion,
		isSelectable: isUnlocked && rankCount > 0,
		isUnlocked,
		progressCount,
		unlockCount,
	};
}
