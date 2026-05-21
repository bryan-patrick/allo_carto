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

/**
 * Concatenation of stage + progress + mistake
 */
export const FEEDBACK_TEXT_FRONT = {
	READY_PENDING_NONE: '',
	READY_PENDING_ARTICLE: 'The article is incorrect!',
	READY_PENDING_WORD: 'The word is incorrect!',
	READY_PENDING_BOTH: 'Both are incorrect!',
	CORRECT_SUCCESS_NONE: '',
	COMPLETED_FAILED_ARTICLE: '',
	COMPLETED_FAILED_WORD: '',
	COMPLETED_FAILED_BOTH: '',
};

export const FEEDBACK_TEXT_BACK = {
	READY_PENDING_NONE: '',
	CORRECT_SUCCESS_NONE: 'Correct! Great Job!',
	COMPLETED_FAILED_ARTICLE: 'That is the wrong article!',
	COMPLETED_FAILED_WORD: 'That is the wrong word!',
	COMPLETED_FAILED_BOTH: 'Both are wrong!',
	READY_PENDING_ARTICLE: '',
	READY_PENDING_WORD: '',
	READY_PENDING_BOTH: '',
};

type FeedbackText =
	| keyof typeof FEEDBACK_TEXT_FRONT
	| keyof typeof FEEDBACK_TEXT_BACK;

export function getFeedbackKey(
	state: Pick<WordCardStateProps, 'stage' | 'progress' | 'mistake'>,
): FeedbackText {
	return `${state.stage}_${state.progress}_${state.mistake}` as FeedbackText;
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
	feedback: FeedbackText;
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
	feedback: 'READY_PENDING_NONE',
};

interface WordCardContextType {
	cardState: WordCardStateProps;
	setCardState: Dispatch<SetStateAction<WordCardStateProps>>;
}

export const WordCardContext = createContext<WordCardContextType>({
	cardState: initialWordCardState,
	setCardState: () => {},
});
