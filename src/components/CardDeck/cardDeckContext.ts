import { createContext, type Dispatch } from 'react';
import { CardDeckAction } from './cardDeckReducer';
import { initialWordState, WordProps } from './cardDeckTypes';

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
	cardDeck: WordProps[];
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
