import { matchSentenceKeywords } from './matchSentenceKeywords';
import { getSentenceKeywords, getTextKeywords } from './sentenceKeywords';
import { getSentenceTokens } from './sentenceTokens';
import type {
	ReviewSentenceAnswerOptions,
	SentenceAnswerReview,
	SentenceMatch,
	SentenceMatchKeyword,
} from './types';
import { getBetterMatch } from './wordMatching';

/**
 * Checks the whole answer and marks the player's words to show what is right and what needs fixing.
 */
export function reviewSentenceAnswer({
	answer,
	sentence,
	language,
}: ReviewSentenceAnswerOptions): SentenceAnswerReview {
	const tokens = getSentenceTokens(answer, language);
	const properNouns = sentence.properNouns ?? [];
	const acceptedOrders: SentenceMatchKeyword[][] = [];
	const frenchAnswers = sentence.frenchArticleFreeAnswers ?? sentence.frenchAnswers;
	const isEmpty = !/[\p{L}\p{N}]/u.test(answer);
	const result: SentenceAnswerReview = {
		status: 'incorrect',
		acceptedAnswer: null,
		words: tokens.parts,
		missingWordCount: 0,
	};
	let bestMatch: SentenceMatch | undefined;

	/**
	 * Collect the allowed wordings so the player can give more than one correct translation.
	 */
	if (language === 'english') {
		acceptedOrders.push(
			sentence.keywords.map(keyword => {
				const result: SentenceMatchKeyword = {
					alternatives: keyword.englishWords.map(getSentenceKeywords),
					isProperNoun: keyword.isProperNoun ?? false,
				};

				return result;
			}),
		);

		if (sentence.englishText) {
			acceptedOrders.push(getTextKeywords(sentence.englishText, language, properNouns));
		}
	} else {
		for (const frenchAnswer of frenchAnswers) {
			acceptedOrders.push(getTextKeywords(frenchAnswer, language, properNouns));
		}
	}

	/**
	 * Compare each allowed wording and choose the one that fits the player's answer best.
	 */
	for (const keywords of acceptedOrders) {
		if (keywords.length > 0) {
			const match = matchSentenceKeywords(tokens.words, keywords, language);

			bestMatch = getBetterMatch(bestMatch, match);
		}
	}

	/**
	 * Put the feedback colors on the player's original text.
	 * A contraction can represent several checked words, so any wrong part keeps the whole typed word red.
	 */
	for (let position = 0; position < tokens.words.length; position++) {
		const word = tokens.words[position];
		const part = result.words[word.partIndex];
		const status = bestMatch?.words[position] ?? 'incorrect';

		if (part.status !== 'incorrect' && status !== 'neutral') {
			part.status = status;
		}
	}

	result.missingWordCount = bestMatch?.missingWordCount ?? 0;

	/**
	 * Accept the answer only when it has no mistakes or missing required words.
	 */
	if (isEmpty) {
		result.status = 'empty';
	} else if (bestMatch?.cost === 0) {
		result.status = 'exact';
		result.acceptedAnswer = answer.trim();
	}

	return result;
}
