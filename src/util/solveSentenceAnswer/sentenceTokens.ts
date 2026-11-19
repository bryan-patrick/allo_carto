import { getFullFrenchElision } from '../frenchWordForms';
import { plainEnglishContractions } from './englishContractions';
import { getFrenchSentencePreposition, normalizeSentenceSpelling } from './sentenceSpelling';
import type { SentenceAnswerLanguage, SentenceTokens } from './types';

/**
 * Articles the player may leave out of a sentence answer.
 */
const optionalSentenceWords = new Set(['a', 'an', 'the', 'some']);
const optionalFrenchSentenceWords = new Set(['le', 'la', 'les', 'un', 'une', 'du', 'des', 'l']);

const plainFrenchOptionalWords = new Set(
	Array.from(optionalFrenchSentenceWords, normalizeSentenceSpelling),
);

/**
 * Marks known names in the typed answer so nearby mistakes cannot make them count as wrong words.
 */
export function markSentenceProperNouns(
	tokens: SentenceTokens,
	properNouns: string[],
	language: SentenceAnswerLanguage,
): void {
	for (const name of properNouns) {
		const nameTokens = getSentenceTokens(name, language);
		const nameWordCount = nameTokens.words.length;

		if (nameWordCount === 0) {
			continue;
		}

		for (let position = 0; position <= tokens.words.length - nameWordCount; position++) {
			const isMatchingName = nameTokens.words.every((word, offset) => {
				return tokens.words[position + offset].text === word.text;
			});

			if (isMatchingName) {
				for (let offset = 0; offset < nameWordCount; offset++) {
					tokens.words[position + offset].isProperNoun = true;
				}
			}
		}
	}
}

/**
 * Splits an answer into words to check
 */
export function getSentenceTokens(text: string, language: SentenceAnswerLanguage): SentenceTokens {
	/**
	 * Rules for finding words and articles in the chosen language
	 */
	let wordPattern = /[\p{L}\p{M}\p{N}]+(?:['’‘ʼ][\p{L}\p{M}\p{N}]+)*|[^\p{L}\p{M}\p{N}]+/gu;
	let optionalWords = optionalSentenceWords;

	if (language === 'french') {
		wordPattern =
			/[\p{L}\p{M}\p{N}]+(?:['’‘ʼ][\p{L}\p{M}\p{N}]+)*(?:['’‘ʼ])?|[^\p{L}\p{M}\p{N}]+/gu;
		optionalWords = plainFrenchOptionalWords;
	}

	/**
	 * The player's original text and the words to compare
	 */
	const pieces = text.match(wordPattern) ?? [];
	const result: SentenceTokens = {
		parts: [],
		words: [],
	};

	for (const piece of pieces) {
		const hasShortArticle = language === 'french' && /^l['’‘ʼ]/iu.test(piece);
		const elisionParts = piece.match(/^([\p{L}\p{M}]+['’‘ʼ])(.*)$/u);
		let fullElisionWord: string | undefined;
		let wordText = piece;
		let displayText = piece;
		let partIndex = result.parts.length;

		/**
		 * Check other elisions with their full words.
		 */
		if (hasShortArticle) {
			wordText = piece.slice(2);
		} else if (language === 'french' && elisionParts) {
			fullElisionWord = getFullFrenchElision(elisionParts[1]);

			if (fullElisionWord) {
				wordText = elisionParts[2];
				displayText = wordText;
				partIndex++;
			}
		}

		const spelling = normalizeSentenceSpelling(wordText);
		let expandedText = getFrenchSentencePreposition(spelling);

		/**
		 * Let a shortened English word fill the same places as its
		 * actual spelling, such as don't for do not.
		 */
		if (language === 'english') {
			expandedText = plainEnglishContractions.get(spelling) ?? spelling;
		}

		const expandedWords = expandedText.split(' ').filter(Boolean);

		/**
		 * Give m’ and d’ their own words to check, just like me and de.
		 */
		if (fullElisionWord && elisionParts) {
			result.words.push({
				text: normalizeSentenceSpelling(fullElisionWord),
				partIndex: result.parts.length,
				isOptional: false,
			});
			result.parts.push({
				text: elisionParts[1],
				status: 'neutral',
			});
		}

		result.parts.push({
			text: displayText,
			status: 'neutral',
		});

		for (const word of expandedWords) {
			result.words.push({
				text: word,
				partIndex,
				isOptional:
					optionalWords.has(word) ||
					(language === 'french' && (spelling === 'du' || spelling === 'des')),
			});
		}
	}

	return result;
}
