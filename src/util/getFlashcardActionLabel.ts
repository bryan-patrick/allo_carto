import type { FlashcardDeckProgress } from '@/src/components/CardDeck/cardDeckTypes';

// Show Continue while a paragraph has an unfinished flashcard cycle.
export function getFlashcardActionLabel(savedProgress?: FlashcardDeckProgress): string {
	if (savedProgress && savedProgress.deckIndex < savedProgress.deckCount) {
		return 'Continue';
	}

	return 'Flashcards';
}
