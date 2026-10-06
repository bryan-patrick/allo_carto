export const minCardsPerDeck = 5;
export const maxCardsPerDeck = 12;

/**
 * Level 8 and all higher levels use the maximum deck size.
 */
export const cardsPerDeckByLevel: Record<number, number> = {
	1: 5,
	2: 6,
	3: 7,
	4: 8,
	5: 9,
	6: 10,
	7: 11,
	8: 12,
};

export function isValidCardsPerDeck(amount: unknown): amount is number {
	return (
		typeof amount === 'number' &&
		Number.isInteger(amount) &&
		amount >= minCardsPerDeck &&
		amount <= maxCardsPerDeck
	);
}

export function getCardsPerDeck(level: number, amount: number | null = null): number {
	if (isValidCardsPerDeck(amount)) return amount;

	return cardsPerDeckByLevel[level] ?? maxCardsPerDeck;
}
