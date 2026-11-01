import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';

interface InkConfig {
	correctFlashcard: number;
	cardCostByRarity: Record<CardRarity, number>;
	incorrectSolveAttempt: number;
	baseMaxBalance: number;
}

/*
 * Set flashcard ink rewards and the costs used for word puzzles.
 */
export const inkConfig: InkConfig = {
	correctFlashcard: 1,
	cardCostByRarity: {
		Common: 1,
		Rare: 2,
		Epic: 3,
		Legendary: 5,
	},
	incorrectSolveAttempt: 1,
	baseMaxBalance: 20,
};

// Start with 20 Ink of space and add one for each level gained after level 1.
export function getMaxInkBalance(playerLevel: number): number {
	const levelsGained = Math.max(0, playerLevel - 1);

	return inkConfig.baseMaxBalance + levelsGained;
}
