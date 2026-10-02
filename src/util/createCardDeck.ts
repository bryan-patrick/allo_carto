import type { CardDeck, CardDeckDefinition } from '@/src/components/CardDeck/cardDeckTypes';
import { getPassageWordIds } from './getPassageWordIds';

/**
 * Add the passage's word IDs to the deck.
 */
export function createCardDeck(deck: CardDeckDefinition): CardDeck {
	return {
		...deck,
		wordIds: getPassageWordIds(deck.passage),
	};
}
