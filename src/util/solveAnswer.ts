/**
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

export type SolveAnswerStatus = 'exact' | 'close' | 'incorrect' | 'empty';

export interface SolveAnswerResult {
	status: SolveAnswerStatus;
	acceptedAnswer: string | null;
}

/**
 * These define tolerances for correct answers.
 * They're forgiving. We don't want to count something wrong because of a small typo.
 */
export const solveAnswerConfig: SolveAnswerConfig = {
	typoAllowances: [
		{ minLength: 0, maxTypos: 0 },
		{ minLength: 4, maxTypos: 1 },
		{ minLength: 6, maxTypos: 2 },
		{ minLength: 10, maxTypos: 3 },
	],
};

/**
 * Normalize the user's answer.
 */
function normalizeSolveAnswer(answer: string): string {
	const compatibleText = answer.normalize('NFKC');
	const lowerCaseText = compatibleText.toLowerCase();
	const textWithoutApostrophes = lowerCaseText.replace(/['’‘ʼ]/gu, '');
	const textWithWordGaps = textWithoutApostrophes.replace(/[^\p{L}\p{N}\s]/gu, ' ');
	const textWithSingleSpaces = textWithWordGaps.replace(/\s+/gu, ' ');

	return textWithSingleSpaces.trim();
}

/**
 * We look for the typed letters in the definition, in order rather than at fixed positions.
 * Missing, extra, or different letters are okay within this word's allowance.
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

/**
 * Check the user's answer with allowed tolerances. It doesn't have to be an exact match.
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
		return { status: 'empty', acceptedAnswer: null };
	}

	if (exactIndex !== -1) {
		return { status: 'exact', acceptedAnswer: englishWords[exactIndex].trim() };
	}

	for (let i = 0; i < definitions.length; i++) {
		const definitionWords = definitions[i].split(' ');
		let matches = answerWords.length === definitionWords.length;

		for (let wordIndex = 0; matches && wordIndex < definitionWords.length; wordIndex++) {
			matches = matchesSolveWord(answerWords[wordIndex], definitionWords[wordIndex]);
		}

		if (matches) {
			return { status: 'close', acceptedAnswer: englishWords[i].trim() };
		}
	}

	return { status: 'incorrect', acceptedAnswer: null };
}
