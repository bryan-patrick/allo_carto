/*
 * Typing
 */
interface SolveTypoAllowance {
	minLength: number;
	maxTypos: number;
}

interface SolveAnswerConfig {
	typoAllowances: SolveTypoAllowance[];
}

export interface CheckSolveAnswerOptions {
	answer: string;
	englishWords: readonly string[];
}

export interface CheckFrenchSolveAnswerOptions {
	answer: string;
	frenchWords: readonly string[];
}

export type SolveAnswerStatus = 'exact' | 'close' | 'incorrect' | 'empty';

export interface SolveAnswerResult {
	status: SolveAnswerStatus;
	acceptedAnswer: string | null;
}

/*
 * Set how many spelling mistakes an English word answer can have.
 */
export const solveAnswerConfig: SolveAnswerConfig = {
	typoAllowances: [
		{
			minLength: 0,
			maxTypos: 0,
		},
		{
			minLength: 4,
			maxTypos: 1,
		},
		{
			minLength: 6,
			maxTypos: 2,
		},
		{
			minLength: 10,
			maxTypos: 3,
		},
	],
};

const optionalArticles = ['a', 'an', 'the'];

/*
 * Clean up an English answer so small writing differences do not count as mistakes.
 */
export function normalizeSolveAnswer(answer: string): string {
	const compatibleText = answer.normalize('NFKC');
	const lowerCaseText = compatibleText.toLowerCase();
	const textWithoutApostrophes = lowerCaseText.replace(/['’‘ʼ]/gu, '');
	const textWithWordGaps = textWithoutApostrophes.replace(/[^\p{L}\p{N}\s]/gu, ' ');
	const textWithSingleSpaces = textWithWordGaps.replace(/\s+/gu, ' ');
	const trimmedText = textWithSingleSpaces.trim();
	const words = trimmedText.split(' ');
	const wordsWithoutArticles = words.filter(word => !optionalArticles.includes(word));
	const textWithoutArticles = wordsWithoutArticles.join(' ');
	const textWithoutInfinitiveTo = textWithoutArticles.replace(/^to\s+/u, '');

	return textWithoutInfinitiveTo || trimmedText;
}

/*
 * Check a word's letters in order while allowing a few spelling mistakes.
 */
function matchesSolveWord(answer: string, definition: string): boolean {
	let allowedTypos = 0;
	let nextPosition = 0;
	let matchedLetters = 0;
	const longerLength = Math.max(answer.length, definition.length);

	for (const allowance of solveAnswerConfig.typoAllowances) {
		if (definition.length >= allowance.minLength) {
			allowedTypos = allowance.maxTypos;
		}
	}

	for (const letter of answer) {
		const position = definition.indexOf(letter, nextPosition);

		if (position !== -1) {
			matchedLetters++;
			nextPosition = position + 1;
		}
	}

	return longerLength - matchedLetters <= allowedTypos;
}

/*
 * Check a typed English meaning against the card's saved answers.
 */
export function checkSolveAnswer({
	answer,
	englishWords,
}: CheckSolveAnswerOptions): SolveAnswerResult {
	const normalizedAnswer = normalizeSolveAnswer(answer);
	const definitions = englishWords.map(normalizeSolveAnswer);
	const exactIndex = definitions.indexOf(normalizedAnswer);
	const answerWords = normalizedAnswer.split(' ');

	if (!normalizedAnswer) {
		return {
			status: 'empty',
			acceptedAnswer: null,
		};
	}

	if (exactIndex !== -1) {
		return {
			status: 'exact',
			acceptedAnswer: englishWords[exactIndex].trim(),
		};
	}

	for (let i = 0; i < definitions.length; i++) {
		const definitionWords = definitions[i].split(' ');
		let matches = answerWords.length === definitionWords.length;

		for (let wordIndex = 0; matches && wordIndex < definitionWords.length; wordIndex++) {
			matches = matchesSolveWord(answerWords[wordIndex], definitionWords[wordIndex]);
		}

		if (matches) {
			return {
				status: 'close',
				acceptedAnswer: englishWords[i].trim(),
			};
		}
	}

	return {
		status: 'incorrect',
		acceptedAnswer: null,
	};
}

/*
 * Clean up a French answer while keeping its accents.
 */
export function normalizeFrenchSolveAnswer(answer: string): string {
	const compatibleText = answer.normalize('NFKC');
	const lowerCaseText = compatibleText.toLowerCase();
	const textWithoutApostrophes = lowerCaseText.replace(/['’‘ʼ]/gu, '');
	const textWithWordGaps = textWithoutApostrophes.replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ');
	const textWithSingleSpaces = textWithWordGaps.replace(/\s+/gu, ' ');

	return textWithSingleSpaces.trim();
}

/*
 * Check the typed French word against the card's saved word forms.
 */
export function checkFrenchSolveAnswer({
	answer,
	frenchWords,
}: CheckFrenchSolveAnswerOptions): SolveAnswerResult {
	const normalizedAnswer = normalizeFrenchSolveAnswer(answer);
	const normalizedWords = frenchWords.map(normalizeFrenchSolveAnswer);
	const acceptedIndex = normalizedWords.indexOf(normalizedAnswer);

	if (!normalizedAnswer) {
		return {
			status: 'empty',
			acceptedAnswer: null,
		};
	}

	if (acceptedIndex === -1) {
		return {
			status: 'incorrect',
			acceptedAnswer: null,
		};
	}

	return {
		status: 'exact',
		acceptedAnswer: frenchWords[acceptedIndex].trim(),
	};
}
