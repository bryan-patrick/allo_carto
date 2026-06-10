/**
 * The context for handling canonical card data and state
 */
import { createContext, type Dispatch } from 'react';
import { CardDeckAction } from './cardDeckReducer';
import type { CardDeck, Word } from './cardDeckTypes';
import { initialWordState } from './cardDeckTypes';

/**
 * Typing
 */
export interface CardDeckContextType {
	cardDeckState: CardDeckStateProps;
	cardDeckDispatch: Dispatch<CardDeckAction>;
}

export interface CardDeckStateProps {
	currentIndex: number;
	currentId: string;
	cardDeck: CardDeck;
	correctWords: Word[];
	incorrectWords: Word[];
}

/**
 * Init Deck state
 */
export const initialCardDeckState: CardDeckStateProps = {
	currentIndex: 0,
	currentId: '',
	correctWords: [],
	incorrectWords: [],
	cardDeck: {
		title: '',
		description: '',
		image: undefined,
		CEFR: [],
		wordIds: [],
		words: [initialWordState],
		wordChoices: [],
	},
};

export const CardDeckContext = createContext<CardDeckContextType>({
	cardDeckState: initialCardDeckState,
	cardDeckDispatch: () => {},
});
