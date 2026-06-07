import { CardDeckStateProps } from './cardDeckContext';
import type { CardDeck } from './cardDeckTypes';

/**
 * Typing
 */
export type CardDeckAction =
	| { type: 'NEXT_CARD' }
	| { type: 'INCREMENT_WORD_SCORE' }
	| { type: 'SET_DECK'; payload: CardDeck };

/**
 * A reducer for deck state
 */
export function cardDeckReducer(
	state: CardDeckStateProps,
	action: CardDeckAction,
): CardDeckStateProps {
	switch (action.type) {
		case 'NEXT_CARD': {
			const nextIndex = state.currentIndex + 1;
			const nextWord = state.cardDeck.words[nextIndex];

			return {
				...state,
				currentIndex: nextIndex,
				currentId: nextWord?.id ?? state.currentId,
			};
		}
		case 'INCREMENT_WORD_SCORE': {
			const words = [...state.cardDeck.words];
			const currentWord = words[state.currentIndex];

			words[state.currentIndex] = {
				...currentWord,
				userScore: currentWord.userScore + 1,
			};

			return {
				...state,
				cardDeck: {
					...state.cardDeck,
					words,
				},
			};
		}
		case 'SET_DECK': {
			const nextCurrentId = action.payload.words[0]?.id ?? '';

			return {
				...state,
				cardDeck: action.payload,
				currentIndex: 0,
				currentId: nextCurrentId,
			};
		}
	}
}
