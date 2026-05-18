/**
 * Context for each individual card in a deck.
 * We may refactor this to be a deck context...not sure yet...
 * Might make more sense when the DB is up.
 *
 * TODO: Refactor?
 */
import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface CardStateProps {
	selectedArticle: string | null;
	selectedWord: string | null;
}

export const initialCardState: CardStateProps = {
	selectedArticle: null,
	selectedWord: null,
};

interface CardContextType {
	cardState: CardStateProps;
	setCardState: Dispatch<SetStateAction<CardStateProps>>;
}

export const CardContext = createContext<CardContextType>({
	cardState: initialCardState,
	setCardState: () => {},
});
