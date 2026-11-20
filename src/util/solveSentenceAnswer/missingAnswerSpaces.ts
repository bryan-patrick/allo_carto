import { normalizeSentenceSpelling } from './sentenceSpelling';
import type { SentenceAnswerWord, SentenceMatch, SentenceTokens } from './types';

interface MissingAnswerSpace {
	partIndex: number;
	characterIndex: number;
	isWholeWord: boolean;
}

/**
 * Finds where letters are missing
 */
function getMissingLetterPositions(answer: string, expected: string): number[] {
	const answerLetters = Array.from(answer);
	const expectedLetters = Array.from(expected);
	const costs: number[][] = [];
	const missingPositions: number[] = [];
	let expectedPosition = expectedLetters.length;
	let answerPosition = answerLetters.length;

	for (let rowIndex = 0; rowIndex <= expectedLetters.length; rowIndex++) {
		const row: number[] = [];

		for (let columnIndex = 0; columnIndex <= answerLetters.length; columnIndex++) {
			let cost = columnIndex;

			if (columnIndex === 0) {
				cost = rowIndex;
			} else if (rowIndex > 0) {
				let replacementCost = 1;

				if (expectedLetters[rowIndex - 1] === answerLetters[columnIndex - 1]) {
					replacementCost = 0;
				}

				const previousRow = costs[rowIndex - 1];
				const replaceLetterCost = previousRow[columnIndex - 1] + replacementCost;
				const missingLetterCost = previousRow[columnIndex] + 1;
				const extraLetterCost = row[columnIndex - 1] + 1;

				cost = Math.min(replaceLetterCost, missingLetterCost, extraLetterCost);
			}

			row.push(cost);
		}

		costs.push(row);
	}

	/**
	 * Follow the closest spelling back to find a gap if incorrect
	 */
	while (expectedPosition > 0 || answerPosition > 0) {
		let replacementCost = 1;

		if (expectedLetters[expectedPosition - 1] === answerLetters[answerPosition - 1]) {
			replacementCost = 0;
		}

		if (
			expectedPosition > 0 &&
			answerPosition > 0 &&
			costs[expectedPosition][answerPosition] ===
				costs[expectedPosition - 1][answerPosition - 1] + replacementCost
		) {
			expectedPosition--;
			answerPosition--;
		} else if (
			expectedPosition > 0 &&
			costs[expectedPosition][answerPosition] === costs[expectedPosition - 1][answerPosition] + 1
		) {
			missingPositions.push(answerPosition);
			expectedPosition--;
		} else {
			answerPosition--;
		}
	}

	missingPositions.reverse();

	return missingPositions;
}

/**
 * Maps the checked letters back to the player's spelling, including accents and apostrophes.
 */
function getOriginalLetterPositions(text: string): number[] {
	const positions: number[] = [];
	let characterIndex = 0;

	for (const character of text) {
		const spelling = normalizeSentenceSpelling(character);
		const letters = Array.from(spelling);

		for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
			positions.push(characterIndex);
		}

		characterIndex += character.length;
	}

	positions.push(text.length);

	return positions;
}

/**
 * Lists the missing letters and words in wat the user put in
 */
function getMissingAnswerSpaces(
	tokens: SentenceTokens,
	match: SentenceMatch,
): MissingAnswerSpace[] {
	const missingSpaces: MissingAnswerSpace[] = [];
	const lastWord = tokens.words[tokens.words.length - 1];

	for (const wordPosition of match.missingWordPositions) {
		const nextWord = tokens.words[wordPosition];
		let partIndex = tokens.parts.length;

		if (nextWord) {
			partIndex = nextWord.partIndex;
		} else if (lastWord) {
			partIndex = lastWord.partIndex + 1;
		}

		missingSpaces.push({
			partIndex,
			characterIndex: 0,
			isWholeWord: true,
		});
	}

	for (let wordPosition = 0; wordPosition < tokens.words.length; wordPosition++) {
		const word = tokens.words[wordPosition];
		const expectedWord = match.expectedWords[wordPosition];
		const part = tokens.parts[word.partIndex];
		const originalSpelling = normalizeSentenceSpelling(part.text);
		const wordStart = originalSpelling.indexOf(word.text);

		if (!expectedWord || word.isProperNoun || word.text === expectedWord || wordStart < 0) {
			continue;
		}

		const missingPositions = getMissingLetterPositions(word.text, expectedWord);
		const originalPositions = getOriginalLetterPositions(part.text);

		for (const missingPosition of missingPositions) {
			const originalPosition = originalPositions[wordStart + missingPosition];

			missingSpaces.push({
				partIndex: word.partIndex,
				characterIndex: originalPosition,
				isWholeWord: false,
			});
		}
	}

	return missingSpaces;
}

/**
 * Adds red blank spaces for missing letters and words
 */
export function addMissingAnswerSpaces(
	tokens: SentenceTokens,
	match: SentenceMatch,
): SentenceAnswerWord[] {
	const missingSpaces = getMissingAnswerSpaces(tokens, match);
	const reviewParts: SentenceAnswerWord[] = [];

	for (let partIndex = 0; partIndex <= tokens.parts.length; partIndex++) {
		const part: SentenceAnswerWord = tokens.parts[partIndex] ?? {
			text: '',
			status: 'neutral',
		};
		const partSpaces = missingSpaces.filter(space => space.partIndex === partIndex);
		let characterIndex = 0;

		partSpaces.sort(compareMissingAnswerSpaces);

		for (const space of partSpaces) {
			const precedingText = part.text.slice(characterIndex, space.characterIndex);
			let blankText = '\u00a0';

			if (precedingText) {
				reviewParts.push({
					text: precedingText,
					status: part.status,
				});
			}

			if (space.isWholeWord) {
				blankText = '\u00a0\u00a0\u00a0';
			}

			reviewParts.push({
				text: blankText,
				status: 'incorrect',
				isMissing: true,
			});
			characterIndex = space.characterIndex;
		}

		if (characterIndex < part.text.length) {
			reviewParts.push({
				text: part.text.slice(characterIndex),
				status: part.status,
			});
		}
	}

	return reviewParts;
}

/**
 * Orders missing spaces by their position
 */
function compareMissingAnswerSpaces(first: MissingAnswerSpace, second: MissingAnswerSpace): number {
	return first.characterIndex - second.characterIndex;
}
