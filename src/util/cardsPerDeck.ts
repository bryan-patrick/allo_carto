export const minCardsPerDeck = 6;
export const maxCardsPerDeck = 12;

/*
 * Start with six cards and add one per level. Level 7 and higher allow twelve cards.
 */
export const cardsPerDeckByLevel: Record<number, number> = {
	1: minCardsPerDeck,
	2: 7,
	3: 8,
	4: 9,
	5: 10,
	6: 11,
	7: maxCardsPerDeck,
};

export function getCardsPerDeck(level: number): number {
	return cardsPerDeckByLevel[level] ?? maxCardsPerDeck;
}
