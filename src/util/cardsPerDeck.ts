export const minCardsPerDeck = 8;
export const maxCardsPerDeck = 16;

// Start with eight cards and add one per level. Level 9 and higher allow sixteen cards.
export const cardsPerDeckByLevel: Record<number, number> = {
	1: minCardsPerDeck,
	2: 9,
	3: 10,
	4: 11,
	5: 12,
	6: 13,
	7: 14,
	8: 15,
	9: maxCardsPerDeck,
};

export function getCardsPerDeck(level: number): number {
	return cardsPerDeckByLevel[level] ?? maxCardsPerDeck;
}
