/**
 * State for each individual card in a deck
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

export interface WordCardStateProps {
	word: WordProps;
	isCorrect: boolean;
	isFlipped: boolean;
	isCompleted: boolean;
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

export const initialWordCardState: WordCardStateProps = {
	word: initialWordState,
	isCorrect: false,
	isFlipped: false,
	isCompleted: false,
	isIncorrect: false,
	selectedArticle: null,
	selectedWord: null,
	correctArticle: null,
	correctWord: null,
};

interface WordCardContextType {
	cardState: WordCardStateProps;
	setCardState: Dispatch<SetStateAction<WordCardStateProps>>;
}

export const WordCardContext = createContext<WordCardContextType>({
	cardState: initialWordCardState,
	setCardState: () => {},
});
