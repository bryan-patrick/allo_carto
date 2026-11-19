import shuffleArray from './shuffleArray';

interface CreateFlashcardDecksOptions {
	wordIds: string[];
	targetCardsPerDeck: number;
	shouldShuffle: boolean;
}

/**
 * Count how many decks the paragraph needs while keeping each deck within the size limit.
 */
export function getFlashcardDeckCount(wordCount: number, targetCardsPerDeck: number): number {
	if (!Number.isInteger(targetCardsPerDeck) || targetCardsPerDeck < 1) {
		throw new Error('The flashcard target must be a positive whole number.');
	}

	if (wordCount === 0) {
		return 0;
	}

	return Math.ceil(wordCount / targetCardsPerDeck);
}

/**
 * Split the paragraph's words into evenly sized decks in passage order or shuffled order.
 */
export function createFlashcardDecks({
	wordIds,
	targetCardsPerDeck,
	shouldShuffle,
}: CreateFlashcardDecksOptions): string[][] {
	/**
	 * Deck sizes and word order
	 */
	const uniqueWordIds = [...new Set(wordIds)];
	const decks: string[][] = [];
	const deckCount = getFlashcardDeckCount(uniqueWordIds.length, targetCardsPerDeck);
	let orderedWordIds = uniqueWordIds;
	let startIndex = 0;

	if (uniqueWordIds.length === 0) {
		return decks;
	}

	const baseDeckSize = Math.floor(uniqueWordIds.length / deckCount);
	const largerDeckCount = uniqueWordIds.length % deckCount;

	if (shouldShuffle) {
		orderedWordIds = shuffleArray(uniqueWordIds);
	}

	/**
	 * Spread leftover cards across decks so their sizes differ by no more than one.
	 */
	for (let deckIndex = 0; deckIndex < deckCount; deckIndex++) {
		let deckSize = baseDeckSize;

		if (deckIndex < largerDeckCount) {
			deckSize = deckSize + 1;
		}

		const endIndex = startIndex + deckSize;
		const deckWordIds = orderedWordIds.slice(startIndex, endIndex);

		decks.push(deckWordIds);
		startIndex = endIndex;
	}

	return decks;
}
