/**
 * The context for handling canonical card data and state
 */
import { createCardDeck } from '@/src/util/createCardDeck';
import { createContext, type Dispatch } from 'react';
import { CardDeckAction } from './cardDeckReducer';
import type { CardDeck, Word } from './cardDeckTypes';
import { initialWordState } from './cardDeckTypes';
import type { DeckSessionProps } from './deckSessionTypes';

/**
 * Typing
 */
export interface CardDeckContextType {
	cardDeckState: CardDeckStateProps;
	cardDeckDispatch: Dispatch<CardDeckAction>;
}

export interface CardDeckStateProps {
	isComplete: boolean;
	currentIndex: number;
	currentId: string;
	cardDeck: CardDeck;
	correctWords: Word[];
	incorrectWords: Word[];
	session?: DeckSessionProps;
}

/**
 * Init Deck state
 */
export const initialCardDeckState: CardDeckStateProps = {
	isComplete: false,
	currentIndex: 0,
	currentId: '',
	correctWords: [],
	incorrectWords: [],
	cardDeck: createCardDeck({
		id: '',
		title: '',
		description: '',
		chapter: '',
		CEFR: [],
		passage: [],
		words: [initialWordState],
		wordChoices: [],
	}),
};

export const CardDeckContext = createContext<CardDeckContextType>({
	cardDeckState: initialCardDeckState,
	cardDeckDispatch: () => {},
});
