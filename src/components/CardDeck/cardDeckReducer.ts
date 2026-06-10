import { CardDeckStateProps } from './cardDeckContext';
import type { CardDeck } from './cardDeckTypes';

/**
 * Typing
 */
export type CardDeckAction =
	| { type: 'NEXT_CARD' }
	| { type: 'INCREMENT_WORD_SCORE' }
	| { type: 'ADD_CORRECT_WORD' }
	| { type: 'ADD_INCORRECT_WORD' }
	| { type: 'SET_DECK'; payload: CardDeck };

/**
 * A reducer for deck state.
 * It mostly adds items to existing state arrays.
 */
export function cardDeckReducer(
	state: CardDeckStateProps,
	action: CardDeckAction,
): CardDeckStateProps {
	const currentWord = state.cardDeck.words[state.currentIndex];

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

			words[state.currentIndex] = {
				...currentWord,
				correctCount: currentWord.correctCount + 1,
			};

			return {
				...state,
				cardDeck: {
					...state.cardDeck,
					words,
				},
			};
		}
		case 'ADD_CORRECT_WORD': {
			return {
				...state,
				correctWords: [...state.correctWords, currentWord],
			};
		}
		case 'ADD_INCORRECT_WORD': {
			return {
				...state,
				incorrectWords: [...state.incorrectWords, currentWord],
			};
		}
		case 'SET_DECK': {
			const nextCurrentId = action.payload.words[0]?.id ?? '';

			return {
				...state,
				cardDeck: action.payload,
				currentIndex: 0,
				currentId: nextCurrentId,
				correctWords: [],
				incorrectWords: [],
			};
		}
	}
}
