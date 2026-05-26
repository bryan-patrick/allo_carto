import { useContext } from 'react';
import { CardDeckContext } from './cardDeckContext';
import { initialWordState } from './cardDeckTypes';

/**
 * A hook wrapper, it's just for destructuring so you
 * can use "currentCard" instead of
 * "cardDeckState.cardDeck.words[cardDeckState.currentIndex]"
 * without destructuring in every single component.
 */
export function useCardDeck() {
	const { cardDeckState, cardDeckDispatch } = useContext(CardDeckContext);
	const currentCard =
		cardDeckState.cardDeck.words[cardDeckState.currentIndex] ??
		initialWordState;

	return {
		cardDeckState,
		cardDeckDispatch,
		currentCard,
	};
}
