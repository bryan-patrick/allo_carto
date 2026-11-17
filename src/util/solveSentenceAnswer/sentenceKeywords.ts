import { getFrenchWordElision } from '../frenchWordForms';
import { normalizeSentenceSpelling } from './sentenceSpelling';
import { getSentenceTokens } from './sentenceTokens';
import type { SentenceAnswerLanguage, SentenceMatchKeyword } from './types';

/**
 * Lists the English words an answer needs, leaving out optional words like a and the.
 */
export function getSentenceKeywords(text: string): string[] {
	const tokens = getSentenceTokens(text, 'english');
	const result: string[] = [];

	for (const word of tokens.words) {
		if (!word.isOptional) {
			result.push(word.text);
		}
	}

	return result;
}

/**
 * Builds the words to look for in one accepted sentence.
 */
export function getTextKeywords(
	text: string,
	language: SentenceAnswerLanguage,
	properNouns: string[],
): SentenceMatchKeyword[] {
	const tokens = getSentenceTokens(text, language);
	const words: string[] = [];
	const names: string[][] = [];
	const result: SentenceMatchKeyword[] = [];

	for (const word of tokens.words) {
		if (!word.isOptional) {
			words.push(word.text);
		}
	}

	/**
	 * Find the words in each name so the checker can treat the whole name as one ungraded part.
	 */
	for (const name of properNouns) {
		const nameTokens = getSentenceTokens(name, language);
		const nameWords: string[] = [];

		for (const word of nameTokens.words) {
			if (!word.isOptional) {
				nameWords.push(word.text);
			}
		}

		if (nameWords.length > 0) {
			names.push(nameWords);
		}
	}

	/**
	 * Check names with more words first so the checker can match the full name.
	 */
	names.sort((first, second) => {
		const result = second.length - first.length;

		return result;
	});

	for (let position = 0; position < words.length; position++) {
		const name = names.find(candidate => {
			let result = true;

			for (let offset = 0; offset < candidate.length; offset++) {
				if (words[position + offset] !== candidate[offset]) {
					result = false;
					break;
				}
			}

			return result;
		});
		const expectedWords = name ?? [words[position]];
		const nextWord = words[position + 1];
		let elision = '';

		if (language === 'french') {
			elision = getFrenchWordElision(words[position]) ?? '';
		}

		/**
		 * Keep the next name separate so accepting a missing apostrophe does not change how names are graded.
		 */
		const nextIsName = names.some(candidate => {
			let result = true;

			for (let offset = 0; offset < candidate.length; offset++) {
				if (words[position + 1 + offset] !== candidate[offset]) {
					result = false;
					break;
				}
			}

			return result;
		});
		const canJoinElision =
			!name && elision && nextWord && /^[aeiouyh]/u.test(nextWord) && !nextIsName;

		if (canJoinElision) {
			const joinedSpelling = normalizeSentenceSpelling(elision + nextWord);

			/**
			 * Accept mappelle as well as m’appelle when the player leaves out the apostrophe.
			 */
			result.push({
				alternatives: [[words[position], nextWord], [joinedSpelling]],
				isProperNoun: false,
			});
			position++;
			continue;
		}

		result.push({
			alternatives: [expectedWords],
			isProperNoun: Boolean(name),
		});
		position += expectedWords.length - 1;
	}

	return result;
}
