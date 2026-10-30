import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';

interface InkConfig {
	correctFlashcard: number;
	cardCostByRarity: Record<CardRarity, number>;
	incorrectSolveAttempt: number;
	maxBalance: number;
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
	maxBalance: 20,
};
