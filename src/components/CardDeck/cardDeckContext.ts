/**
 * The context for handling canonical card data and state
 */
import { createContext, type Dispatch } from 'react';
import { CardDeckAction } from './cardDeckReducer';
import { initialWordState, Word } from './cardDeckTypes';

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
	cardDeck: Word[];
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
