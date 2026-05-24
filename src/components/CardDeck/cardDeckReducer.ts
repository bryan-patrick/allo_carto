import { CardDeckStateProps } from './cardDeckContext';
import { mockDeck } from './mockCardDeck';

/**
 * Typing
 */
export type CardDeckAction =
	| { type: 'GET_DECK' }
	| { type: 'NEXT_CARD' }
	| { type: 'INCREMENT_WORD_SCORE' };

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
				cardDeck: mockDeck,
				currentIndex: 0,
				currentId: mockDeck[0]?.id ?? '',
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
