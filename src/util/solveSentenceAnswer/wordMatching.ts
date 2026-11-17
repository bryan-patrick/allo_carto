import { checkSolveAnswer } from '../solveAnswer';
import type { SentenceAnswerLanguage, SentenceMatch } from './types';

/**
 * Chooses the comparison with the fewest mistakes, favoring more correct words and then fewer missing words.
 */
export function getBetterMatch(
	current: SentenceMatch | undefined,
	candidate: SentenceMatch,
): SentenceMatch {
	let result = candidate;

	if (current) {
		result = current;

		if (candidate.cost < current.cost) {
			result = candidate;
		} else if (candidate.cost === current.cost) {
			if (candidate.correctWordCount > current.correctWordCount) {
				result = candidate;
			} else if (
				candidate.correctWordCount === current.correctWordCount &&
				candidate.missingWordCount < current.missingWordCount
			) {
				result = candidate;
			}
		}
	}

	return result;
}

/**
 * Checks whether one typed word is close enough to the word the sentence needs.
 */
export function matchesSentenceWord(
	answer: string,
	expected: string,
	language: SentenceAnswerLanguage,
): boolean {
	let result = false;

	/**
	 * Allow the same small English typos that the word puzzles accept.
	 */
	if (language === 'english') {
		const wordCheck = checkSolveAnswer({
			answer,
			englishWords: [expected],
		});

		result = wordCheck.status === 'exact' || wordCheck.status === 'close';
	} else if (answer === expected) {
		result = true;
	} else {
		/**
		 * Accept lhiver for hiver when the player types l’hiver without its apostrophe.
		 */
		result = answer === 'l' + expected;
	}

	return result;
}
