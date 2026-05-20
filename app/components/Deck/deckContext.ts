import { createContext, type Dispatch } from 'react';
import type { WordProps } from '../WordCard/cardContext';
import { initialWordState } from '../WordCard/cardContext';
import { mockDeck } from './mockDeck';

/**
 * Typing
 */
type DeckAction = { type: 'get_a_deck' } | { type: 'next_card' };

interface DeckStateProps {
	currentIndex: number;
	currentId: string;
	deck: WordProps[];
}

interface DeckContextType {
	deckState: DeckStateProps;
	deckDispatch: Dispatch<DeckAction>;
}

/**
 * A reducer for deck state
 */
export function deckReducer(
	state: DeckStateProps,
	action: DeckAction,
): DeckStateProps {
	if (action.type === 'get_a_deck') {
		return {
			...state,
			deck: mockDeck,
			currentIndex: 0,
			currentId: mockDeck[0]?.id ?? '',
		};
	}

	if (action.type === 'next_card') {
		const nextIndex = state.currentIndex + 1;
		const nextWord = state.deck[nextIndex];

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
export const initialDeckState: DeckStateProps = {
	currentIndex: 0,
	currentId: '',
	deck: [initialWordState],
};

export const DeckContext = createContext<DeckContextType>({
	deckState: initialDeckState,
	deckDispatch: () => {},
});
