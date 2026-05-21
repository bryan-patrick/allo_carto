import { createContext, type Dispatch } from 'react';
import type { WordProps } from '../WordCard/wordCardContext';
import { initialWordState } from '../WordCard/wordCardContext';
import { mockDeck as mockCardDeck } from './mockCardDeck';

/**
 * Typing
 */
type CardDeckAction = { type: 'get_a_deck' } | { type: 'next_card' };

interface CardDeckStateProps {
	currentIndex: number;
	currentId: string;
	cardDeck: WordProps[];
}

interface CardDeckContextType {
	cardDeckState: CardDeckStateProps;
	cardDeckDispatch: Dispatch<CardDeckAction>;
}

/**
 * A reducer for deck state
 */
export function cardDeckReducer(
	state: CardDeckStateProps,
	action: CardDeckAction,
): CardDeckStateProps {
	if (action.type === 'get_a_deck') {
		return {
			...state,
			cardDeck: mockCardDeck,
			currentIndex: 0,
			currentId: mockCardDeck[0]?.id ?? '',
		};
	}

	if (action.type === 'next_card') {
		const nextIndex = state.currentIndex + 1;
		const nextWord = state.cardDeck[nextIndex];

		return {
			...state,
			currentIndex: nextIndex,
			currentId: nextWord?.id ?? state.currentId,
		};
	}

	return state;
}

/**
 * Init Deck state
 */
export const initialCardDeckState: CardDeckStateProps = {
	currentIndex: 0,
	currentId: '',
	cardDeck: [initialWordState],
};

export const CardDeckContext = createContext<CardDeckContextType>({
	cardDeckState: initialCardDeckState,
	cardDeckDispatch: () => {},
});
