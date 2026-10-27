import type { DeckSessionProps } from '@/src/components/CardDeck/deckSessionTypes';

/**
 * We start a fresh results list before showing the first flashcard.
 */
export function createDeckSession(xpBefore: number): DeckSessionProps {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		xpBefore,
		results: [],
	};
}
