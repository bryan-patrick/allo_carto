import shuffleArray from './shuffleArray';

/**
 * Remove repeated word IDs, shuffle the words, and split them into nearly equal decks.
 * Include every word once and keep each deck at or below 1.5 times the target card count.
 */
export function createFlashcardDecks(wordIds: string[], targetCardsPerDeck: number): string[][] {
	const uniqueWordIds = [...new Set(wordIds)];
	const decks: string[][] = [];
	let startIndex = 0;

	if (!Number.isInteger(targetCardsPerDeck) || targetCardsPerDeck < 1) {
		throw new Error('The flashcard target must be a positive whole number.');
	}

	if (uniqueWordIds.length === 0) {
		return decks;
	}

	const shuffledWordIds = shuffleArray(uniqueWordIds);
	const maximumCardsPerDeck = Math.floor(targetCardsPerDeck * 1.5);

	/**
	 * First, find how many decks we can make while keeping each at least the target size.
	 * Add more decks if needed to stay under the maximum. With 19 cards and a target of
	 * 10, we need two decks because one deck would pass the maximum of 15.
	 */
	const deckCountForTarget = Math.floor(shuffledWordIds.length / targetCardsPerDeck);
	const deckCountForMaximum = Math.ceil(shuffledWordIds.length / maximumCardsPerDeck);
	const deckCount = Math.max(1, deckCountForTarget, deckCountForMaximum);
	const baseDeckSize = Math.floor(shuffledWordIds.length / deckCount);
	const largerDeckCount = shuffledWordIds.length % deckCount;

	/**
	 * Give each deck the same number of cards, then give one extra card to each of the
	 * first few decks until we use the leftovers. This makes 19 cards into decks of
	 * 10 and 9, so the learner never gets a tiny deck at the end.
	 */
	for (let deckIndex = 0; deckIndex < deckCount; deckIndex++) {
		let deckSize = baseDeckSize;

		if (deckIndex < largerDeckCount) {
			deckSize = deckSize + 1;
		}

		const endIndex = startIndex + deckSize;
		const deckWordIds = shuffledWordIds.slice(startIndex, endIndex);

		decks.push(deckWordIds);
		startIndex = endIndex;
	}

	return decks;
}
