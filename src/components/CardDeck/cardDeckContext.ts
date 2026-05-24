import { createContext, type Dispatch } from 'react';
import { initialWordState, type WordProps } from './cardDeckTypes';
import { mockDeck as mockCardDeck } from './mockCardDeck';

/**
 * Typing
 */
type CardDeckAction =
	| { type: 'GET_DECK' }
	| { type: 'NEXT_CARD' }
	| { type: 'INCREMENT_WORD_SCORE' };

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
	switch (action.type) {
		case 'GET_DECK':
			return {
				...state,
				cardDeck: mockCardDeck,
				currentIndex: 0,
				currentId: mockCardDeck[0]?.id ?? '',
			};
		case 'NEXT_CARD':
			const nextIndex = state.currentIndex + 1;
			const nextWord = state.cardDeck[nextIndex];

			return {
				...state,
				currentIndex: nextIndex,
				currentId: nextWord?.id ?? state.currentId,
			};
		case 'INCREMENT_WORD_SCORE': {
			if (!state.cardDeck[state.currentIndex]) return state;

			return {
				...state,
				cardDeck: state.cardDeck.map((word, index) => {
					if (index === state.currentIndex)
						return { ...word, userScore: word.userScore + 1 };
					return word;
				}),
			};
		}
		default:
			return state;
	}
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
