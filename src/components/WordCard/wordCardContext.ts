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

export type CardStage = 'READY' | 'CORRECT' | 'COMPLETED';
export type CardProgress = 'PENDING' | 'SUCCESS' | 'FAILED';
export type CardMistake = 'NONE' | 'ARTICLE' | 'WORD' | 'BOTH';

export interface WordCardStateProps {
	word: WordProps;
	isFlipped: boolean;
	selectedArticle: string | null;
	selectedWord: string | null;
	correctArticle: string | null;
	correctWord: string | null;
	stage: CardStage;
	progress: CardProgress;
	mistake: CardMistake;
}

export const initialWordState: WordProps = {
	id: '',
	translation: '',
	pronunciation: '',
	CEFRLevel: '',
};

export const initialWordCardState: WordCardStateProps = {
	word: initialWordState,
	isFlipped: false,
	selectedArticle: null,
	selectedWord: null,
	correctArticle: null,
	correctWord: null,
	stage: 'READY',
	progress: 'PENDING',
	mistake: 'NONE',
};

interface WordCardContextType {
	cardState: WordCardStateProps;
	setCardState: Dispatch<SetStateAction<WordCardStateProps>>;
}

export const WordCardContext = createContext<WordCardContextType>({
	cardState: initialWordCardState,
	setCardState: () => {},
});
