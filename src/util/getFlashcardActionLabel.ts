import type { FlashcardDeckProgress } from '@/src/components/CardDeck/cardDeckTypes';
import { getFlashcardDeckCount } from './createFlashcardDecks';

interface FlashcardActionLabelOptions {
	wordCount: number;
	targetCardsPerDeck: number;
	savedProgress?: FlashcardDeckProgress;
}

// Build a label like "Flashcards (2/3)" for the deck the learner will play next.
export function getFlashcardActionLabel({
	wordCount,
	targetCardsPerDeck,
	savedProgress,
}: FlashcardActionLabelOptions): string {
	const deckCount =
		savedProgress?.deckCount ?? getFlashcardDeckCount(wordCount, targetCardsPerDeck);
	const deckIndex = savedProgress?.deckIndex ?? 0;
	const deckNumber = deckIndex + 1;

	if (deckCount === 0) {
		return 'Flashcards';
	}

	return `Flashcards (${deckNumber}/${deckCount})`;
}
