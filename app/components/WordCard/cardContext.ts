/**
 * Context for each individual card in a deck.
 * We may refactor this to be a deck context...not sure yet...
 * Might make more sense when the DB is up.
 *
 * TODO: Refactor?
 */
import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface WordProps {
	id: string;
	translation: string;
	pronunciation: string;
	CEFRLevel: string;
	lemmaId?: string;
	frenchArticle?: string;
	englishArticle?: string;
	tense?: string;
	gender?: 'feminine' | 'masculine';
	partOfSpeech?: string;
	userScore?: number;
}

export interface CardStateProps {
	word: WordProps;
	isCompleted: boolean;
	isCorrect: boolean;
	isIncorrect: boolean;
	selectedArticle: string | null;
	selectedWord: string | null;
	correctArticle: string | null;
	correctWord: string | null;
}

export const initialWordState: WordProps = {
	id: '',
	translation: '',
	pronunciation: '',
	CEFRLevel: '',
};

export const initialCardState: CardStateProps = {
	word: initialWordState,
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
