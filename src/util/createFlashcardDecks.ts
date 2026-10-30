import shuffleArray from './shuffleArray';

// Count how many decks the paragraph needs while keeping each deck within the size limit.
export function getFlashcardDeckCount(wordCount: number, targetCardsPerDeck: number): number {
	if (!Number.isInteger(targetCardsPerDeck) || targetCardsPerDeck < 1) {
		throw new Error('The flashcard target must be a positive whole number.');
	}

	if (wordCount === 0) {
		return 0;
	}

	const maximumCardsPerDeck = Math.floor(targetCardsPerDeck * 1.5);
	const deckCountForTarget = Math.floor(wordCount / targetCardsPerDeck);
	const deckCountForMaximum = Math.ceil(wordCount / maximumCardsPerDeck);

	return Math.max(1, deckCountForTarget, deckCountForMaximum);
}

/*
 * Shuffle the paragraph's words into evenly sized decks.
 * Include each word once and cap each deck at 1.5 times the target size.
 */
export function createFlashcardDecks(wordIds: string[], targetCardsPerDeck: number): string[][] {
	const uniqueWordIds = [...new Set(wordIds)];
	const decks: string[][] = [];
	const deckCount = getFlashcardDeckCount(uniqueWordIds.length, targetCardsPerDeck);
	let startIndex = 0;

	if (uniqueWordIds.length === 0) {
		return decks;
	}

	const shuffledWordIds = shuffleArray(uniqueWordIds);
	const baseDeckSize = Math.floor(shuffledWordIds.length / deckCount);
	const largerDeckCount = shuffledWordIds.length % deckCount;

	// Spread leftover cards across decks so their sizes differ by no more than one.
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
