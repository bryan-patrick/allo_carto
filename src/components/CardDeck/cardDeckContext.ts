/**
 * The context for handling canonical card data and state
 */
import { CardDeck } from '@/data/french/decks/deckTyps';
import { createContext, type Dispatch } from 'react';
import { CardDeckAction } from './cardDeckReducer';
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
}

/**
 * Init Deck state
 */
export const initialCardDeckState: CardDeckStateProps = {
	currentIndex: 0,
	currentId: '',
	cardDeck: {
		title: '',
		description: '',
		CEFR: [],
		wordIds: [],
		words: [initialWordState],
	},
};

export const CardDeckContext = createContext<CardDeckContextType>({
	cardDeckState: initialCardDeckState,
	cardDeckDispatch: () => {},
});
