export const minCardsPerDeck = 8;
export const maxCardsPerDeck = 12;
export const cardsPerDeckByLevel: Record<number, number> = {
	1: minCardsPerDeck,
	2: minCardsPerDeck,
	3: 9,
	4: 9,
	5: 10,
	6: 10,
	7: 11,
	8: 11,
	9: maxCardsPerDeck,
};

/**
 * Gets the flashcard limit for the player's level.
 */
export function getCardsPerDeck(level: number): number {
	return cardsPerDeckByLevel[level] ?? maxCardsPerDeck;
}
