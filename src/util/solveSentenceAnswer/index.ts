import type { SolveAnswerResult } from '../solveAnswer';
import { reviewSentenceAnswer } from './reviewSentenceAnswer';
import type { CheckSentenceAnswerOptions, ReviewSentenceAnswerOptions } from './types';

export { reviewSentenceAnswer } from './reviewSentenceAnswer';
export { getSentenceKeywords } from './sentenceKeywords';
export { getFrenchSentencePreposition } from './sentenceSpelling';
export type {
	CheckSentenceAnswerOptions,
	SentenceAnswerLanguage,
	SentenceAnswerReview,
	SentenceAnswerWord,
	SentenceAnswerWordStatus,
} from './types';

/**
 * Checks an English translation against the word meanings and the story's English sentence.
 */
export function checkSentenceAnswer(options: CheckSentenceAnswerOptions): SolveAnswerResult {
	const reviewOptions: ReviewSentenceAnswerOptions = {
		...options,
		language: 'english',
	};
	const result = reviewSentenceAnswer(reviewOptions);

	return result;
}

/**
 * Checks a French translation against the allowed French sentences without requiring accents or exact name spelling.
 */
export function checkFrenchSentenceAnswer(options: CheckSentenceAnswerOptions): SolveAnswerResult {
	const reviewOptions: ReviewSentenceAnswerOptions = {
		...options,
		language: 'french',
	};
	const result = reviewSentenceAnswer(reviewOptions);

	return result;
}
