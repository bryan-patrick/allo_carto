import { useContext } from 'react';
import { CardDeckContext } from './cardDeckContext';

/**
 * A hook wrapper, it's just for destructuring so you
 * can use "currentDeck" instead of
 * "cardDeckState.cardDeck[cardDeckState.currentIndex]"
 * without destructuring in every single component.
 */
export function useCardDeck() {
	const { cardDeckState, cardDeckDispatch } = useContext(CardDeckContext);
	const currentCard = cardDeckState.cardDeck[cardDeckState.currentIndex];

	return {
		cardDeckState,
		cardDeckDispatch,
		currentCard,
	};
}
