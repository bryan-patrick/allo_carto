import type { DeckRankCounts } from '../db/queries/getDeckRankCounts';
import type { WordRankDefinition } from './wordRanks';
import { wordRankDefinitions } from './wordRanks';

function getDeckRankUnlockCount(deckWordCount: number): number {
	return Math.ceil(Math.max(deckWordCount, 0) / 2);
}

/**
 * A deck's current rank is its highest rank reached by at least half its cards.
 */
export function getCurrentDeckRankDefinition({
	deckWordCount,
	rankCounts,
}: {
	deckWordCount: number;
	rankCounts: DeckRankCounts;
}): WordRankDefinition {
	const unlockCount = getDeckRankUnlockCount(deckWordCount);
	let currentRank = wordRankDefinitions[0];

	if (deckWordCount <= 0) return currentRank;

	for (let rankIndex = 1; rankIndex < wordRankDefinitions.length; rankIndex++) {
		let cardsAtOrAboveRank = 0;

		for (let index = rankIndex; index < wordRankDefinitions.length; index++) {
			cardsAtOrAboveRank += rankCounts[wordRankDefinitions[index].key] ?? 0;
		}

		if (cardsAtOrAboveRank < unlockCount) break;

		currentRank = wordRankDefinitions[rankIndex];
	}

	return currentRank;
}
