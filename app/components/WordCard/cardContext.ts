/**
 * Context for each individual card in a deck.
 * We may refactor this to be a deck context...not sure yet...
 * Might make more sense when the DB is up.
 *
 * TODO: Refactor?
 */
import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface CardStateProps {
	isCompleted: boolean;
	isCorrect: boolean;
	isIncorrect: boolean;
	selectedArticle: string | null;
	selectedWord: string | null;
	correctArticle: string | null;
	correctWord: string | null;
}

export const initialCardState: CardStateProps = {
	isCompleted: false,
	isCorrect: false,
	isIncorrect: false,
	selectedArticle: null,
	selectedWord: null,
	correctArticle: null,
	correctWord: null,
};

interface CardContextType {
	cardState: CardStateProps;
	setCardState: Dispatch<SetStateAction<CardStateProps>>;
}

export const CardContext = createContext<CardContextType>({
	cardState: initialCardState,
	setCardState: () => {},
});
