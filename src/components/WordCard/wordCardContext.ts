/**
 * UI State for each individual card in a deck
 * This context handles UI updates and layout
 */
import { createContext, type Dispatch } from 'react';
import { type WordCardUIAction } from './wordCardUIReducer';

/**
 * Concatenation of stage + progress + mistake
 */
export const FEEDBACK_TEXT_FRONT: Partial<Record<FeedbackKey, string>> = {
	READY_PENDING_NONE: '',
	READY_WARNING_ARTICLE: 'The article is incorrect! Try again.',
	READY_WARNING_WORD: 'The word is incorrect! Try again.',
	READY_WARNING_BOTH: 'Both are incorrect! Try again.',
	INCORRECT_WARNING_ARTICLE: 'The article is incorrect! Try again.',
	INCORRECT_WARNING_WORD: 'The word is incorrect! Try again.',
	INCORRECT_WARNING_BOTH: 'Both are incorrect! Try again.',
	COMPLETED_DANGER_ARTICLE: 'That is the wrong article!',
	COMPLETED_DANGER_WORD: 'That is the wrong word!',
	COMPLETED_DANGER_BOTH: 'Both are wrong!',
	INCORRECT_DANGER_BOTH: 'Both are incorrect! Try again next time.',
	INCORRECT_DANGER_WORD: 'That is the wrong word!',
	INCORRECT_DANGER_ARTICLE: 'That is the wrong article!',
};

export const FEEDBACK_TEXT_BACK: Partial<Record<FeedbackKey, string>> = {
	READY_PENDING_NONE: '',
	CORRECT_SUCCESS_NONE: 'Correct! Great Job!',
};

export type FeedbackKey = `${CardStage}_${CardProgress}_${CardMistake}`;

export function getFeedbackKey(
	state: Pick<WordCardStateProps, 'stage' | 'progress' | 'mistake'>,
): FeedbackKey {
	return `${state.stage}_${state.progress}_${state.mistake}`;
}

/**
 * It might seem redundant to have both stage and
 * progress, BUT they are two separate moving pieces
 * of state and CAN move independently of each other.
 *
 * It also allows us to expand the state machine
 * later if we need to.
 */
export type CardStage = 'READY' | 'CORRECT' | 'INCORRECT' | 'COMPLETED';
export type CardProgress = 'PENDING' | 'SUCCESS' | 'WARNING' | 'DANGER';
export type CardMistake = 'NONE' | 'ARTICLE' | 'WORD' | 'BOTH';

export interface WordCardStateProps {
	isFlipped: boolean;
	selectedArticle: string | null;
	selectedWord: string | null;
	stage: CardStage;
	progress: CardProgress;
	mistake: CardMistake;
	feedbackKey: FeedbackKey;
	attempts: number;
	maxAttempts: number;
}

export const initialWordCardState: WordCardStateProps = {
	isFlipped: false,
	selectedArticle: null,
	selectedWord: null,
	stage: 'READY',
	progress: 'PENDING',
	mistake: 'NONE',
	feedbackKey: 'READY_PENDING_NONE',
	attempts: 0,
	maxAttempts: 2,
};

interface WordCardContextType {
	cardState: WordCardStateProps;
	wordCardUIDispatch: Dispatch<WordCardUIAction>;
}

export const WordCardUIContext = createContext<WordCardContextType>({
	cardState: initialWordCardState,
	wordCardUIDispatch: () => {},
});
