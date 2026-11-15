import type { CardDeck, CardDeckDefinition } from '@/src/components/CardDeck/cardDeckTypes';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';

interface DeprecatedCardDeckDefinition extends CardDeckDefinition {
	title: string;
	chapter: string;
}

export interface DeprecatedCardDeck extends CardDeck {
	title: string;
	chapter: string;
}

/**
 * Keep retired deck data readable in its original format.
 */
export function createCardDeck(deck: DeprecatedCardDeckDefinition): DeprecatedCardDeck {
	return {
		...deck,
		wordIds: getPassageWordIds(deck.passage),
	};
}
