import type {
	SentenceAnswerLanguage,
	SentenceAnswerWordStatus,
	SentenceMatch,
	SentenceWordToken,
} from './types';
import { getBetterMatch, matchesSentenceWord } from './wordMatching';

interface MatchExpectedWordOptions {
	answerWords: SentenceWordToken[];
	previousMatches: SentenceMatch[];
	expectedWord: string;
	isProperNoun: boolean;
	language: SentenceAnswerLanguage;
}

/**
 * Compares one expected word with the player's answer while allowing missing or extra words.
 */
export function matchExpectedWord({
	answerWords,
	previousMatches,
	expectedWord,
	isProperNoun,
	language,
}: MatchExpectedWordOptions): SentenceMatch[] {
	/**
	 * First comparison and the results for this expected word
	 */
	const firstMatch = previousMatches[0];
	const firstMissingWord: SentenceMatch = {
		...firstMatch,
		missingWordPositions: [...firstMatch.missingWordPositions, 0],
	};
	const nextMatches: SentenceMatch[] = [];

	/**
	 * Allow this expected word to be missing so later words can still match.
	 */
	firstMissingWord.cost++;
	firstMissingWord.missingWordCount++;
	nextMatches.push(firstMissingWord);

	for (let position = 1; position <= answerWords.length; position++) {
		/**
		 * Earlier comparisons and the current typed word
		 */
		const answerWord = answerWords[position - 1];
		const previousMatch = previousMatches[position - 1];
		const previousMissing = previousMatches[position];
		const previousExtra = nextMatches[position - 1];
		const isCorrect = isProperNoun || matchesSentenceWord(answerWord.text, expectedWord, language);

		/**
		 * Possible results for a matching, missing, or extra word
		 */
		const matchedWord: SentenceMatch = {
			cost: previousMatch.cost,
			correctWordCount: previousMatch.correctWordCount,
			missingWordCount: previousMatch.missingWordCount,
			words: [...previousMatch.words],
			expectedWords: [...previousMatch.expectedWords, expectedWord],
			missingWordPositions: previousMatch.missingWordPositions,
		};
		const missingWord: SentenceMatch = {
			...previousMissing,
			missingWordPositions: [...previousMissing.missingWordPositions, position],
		};
		const extraWord: SentenceMatch = {
			...previousExtra,
			words: [...previousExtra.words],
			expectedWords: [...previousExtra.expectedWords, ''],
		};
		let bestWithoutExtra: SentenceMatch;

		/**
		 * Initial feedback for the typed word
		 */
		let wordStatus: SentenceAnswerWordStatus = 'incorrect';
		let extraWordStatus: SentenceAnswerWordStatus = 'incorrect';

		if (isCorrect) {
			wordStatus = 'correct';
		}

		if (isProperNoun || answerWord.isProperNoun) {
			wordStatus = 'neutral';
		}

		if (answerWord.isOptional || answerWord.isProperNoun) {
			extraWordStatus = 'neutral';
		}

		/**
		 * Try treating this as a wrong word, a missing word, or an extra word.
		 * Choose the best fit so one mistake does not turn every later word red.
		 */
		if (!isCorrect) {
			matchedWord.cost++;
		}

		if (isCorrect && !isProperNoun && !answerWord.isProperNoun) {
			matchedWord.correctWordCount++;
		}

		matchedWord.words.push(wordStatus);
		missingWord.cost++;
		missingWord.missingWordCount++;

		if (!answerWord.isOptional && !answerWord.isProperNoun) {
			extraWord.cost++;
		}

		extraWord.words.push(extraWordStatus);
		bestWithoutExtra = getBetterMatch(matchedWord, missingWord);
		nextMatches.push(getBetterMatch(bestWithoutExtra, extraWord));
	}

	return nextMatches;
}
