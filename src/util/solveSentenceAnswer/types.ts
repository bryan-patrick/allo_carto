import type { SolveSentence } from '@/src/components/Solve/solveTypes';
import type { SolveAnswerResult } from '../solveAnswer';

/**
 * Answer details and word-by-word feedback
 */
export interface CheckSentenceAnswerOptions {
	answer: string;
	sentence: SolveSentence;
}

export type SentenceAnswerLanguage = 'english' | 'french';
export type SentenceAnswerWordStatus = 'correct' | 'incorrect' | 'neutral';

export interface SentenceAnswerWord {
	text: string;
	status: SentenceAnswerWordStatus;
}

export interface SentenceAnswerReview extends SolveAnswerResult {
	words: SentenceAnswerWord[];
	missingWordCount: number;
}

export interface ReviewSentenceAnswerOptions extends CheckSentenceAnswerOptions {
	language: SentenceAnswerLanguage;
}

export interface SentenceWordToken {
	text: string;
	partIndex: number;
	isOptional: boolean;
}

export interface SentenceTokens {
	parts: SentenceAnswerWord[];
	words: SentenceWordToken[];
}

export interface SentenceMatchKeyword {
	alternatives: string[][];
	isProperNoun: boolean;
}

export interface SentenceMatch {
	cost: number;
	correctWordCount: number;
	missingWordCount: number;
	words: SentenceAnswerWordStatus[];
}
