import { matchExpectedWord } from './matchExpectedWord';
import type {
	SentenceAnswerLanguage,
	SentenceAnswerWordStatus,
	SentenceMatch,
	SentenceMatchKeyword,
	SentenceWordToken,
} from './types';
import { getBetterMatch } from './wordMatching';

/**
 * Finds correct, missing, and extra words without letting one mistake spoil the rest of the feedback.
 */
export function matchSentenceKeywords(
	answerWords: SentenceWordToken[],
	keywords: SentenceMatchKeyword[],
	language: SentenceAnswerLanguage,
): SentenceMatch {
	/**
	 * Results before any expected words have been compared
	 */
	let result: SentenceMatch = {
		cost: 0,
		correctWordCount: 0,
		missingWordCount: 0,
		words: [],
	};
	let matches: SentenceMatch[] = [result];

	/**
	 * Allow extra words before the sentence without losing credit for correct words later on.
	 */
	for (const word of answerWords) {
		const previous = matches[matches.length - 1];
		const unmatchedWord: SentenceMatch = {
			...previous,
			words: [...previous.words],
		};
		let wordStatus: SentenceAnswerWordStatus = 'incorrect';

		if (word.isOptional || word.isProperNoun) {
			wordStatus = 'neutral';
		} else {
			unmatchedWord.cost++;
		}

		unmatchedWord.words.push(wordStatus);
		matches.push(unmatchedWord);
	}

	for (const keyword of keywords) {
		/**
		 * Allowed wordings and their best comparisons
		 */
		const nameWordCounts = keyword.alternatives.map(option => option.length);
		const longestName = Math.max(1, ...nameWordCounts);
		const bestMatches: (SentenceMatch | undefined)[] = [];
		let alternatives = keyword.alternatives;

		/**
		 * Let a name fill one or more word positions without grading its spelling.
		 */
		if (keyword.isProperNoun) {
			alternatives = [];

			for (let wordCount = 1; wordCount <= longestName; wordCount++) {
				const nameWords = Array<string>(wordCount);

				nameWords.fill('');
				alternatives.push(nameWords);
			}
		}

		for (const alternative of alternatives) {
			let optionMatches = matches;

			for (const expectedWord of alternative) {
				optionMatches = matchExpectedWord({
					answerWords,
					previousMatches: optionMatches,
					expectedWord,
					isProperNoun: keyword.isProperNoun,
					language,
				});
			}

			/**
			 * Keep the best result from each allowed wording of this part of the sentence.
			 */
			for (let position = 0; position < optionMatches.length; position++) {
				bestMatches[position] = getBetterMatch(bestMatches[position], optionMatches[position]);
			}
		}

		/**
		 * Carry these results forward before comparing the next expected word.
		 */
		matches = bestMatches.map((match, position) => {
			const result = match ?? matches[position];

			return result;
		});
	}

	result = matches[answerWords.length];

	return result;
}
