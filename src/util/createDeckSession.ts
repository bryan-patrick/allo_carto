import type { DeckSessionProps } from '@/src/components/CardDeck/deckSessionTypes';

/**
 * Every time the user starts a new deck it creates a new session before showing the first card.
 */
export function createDeckSession(xpBefore: number): DeckSessionProps {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		xpBefore,
		results: [],
	};
}
