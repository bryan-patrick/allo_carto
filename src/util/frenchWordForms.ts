import { seedWords } from '@/data/french/words';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Vocab and spellings for sentence elisions
 */
const wordsById = new Map(seedWords.map(word => [word.id, word]));
const fullWordsByElision = getFullWordsByElision(seedWords);

/**
 * Match each elision to its spelling
 */
function getFullWordsByElision(words: Word[]): Map<string, string> {
	const fullWords = new Map<string, string>();

	for (const word of words) {
		if (word.fullFrenchWord && word.partOfSpeech !== 'article') {
			const elision = normalizeFrenchElision(word.frenchWord);

			fullWords.set(elision, word.fullFrenchWord);
		}
	}

	return fullWords;
}

/**
 * This was a huge gotcha, includes both symbols for apostrophes
 */
function normalizeFrenchElision(text: string): string {
	const lowerCaseText = text.toLowerCase();
	const plainApostrophes = lowerCaseText.replace(/[’‘ʼ]/gu, "'");

	return plainApostrophes;
}

/**
 * Get a word's full and elided spellings for the puzzles.
 */
export function getFrenchWordForms(wordId: string): string[] {
	const word = wordsById.get(wordId);
	const forms: string[] = [];

	if (!word) {
		return forms;
	}

	forms.push(word.frenchWord);

	if (word.fullFrenchWord) {
		forms.push(word.fullFrenchWord);
	}

	if (word.elision) {
		forms.push(word.elision.frenchWord);
	}

	return forms;
}

/**
 * Get the full elision word at the start of a French sentence word.
 */
export function getFullFrenchElision(text: string): string | undefined {
	const elision = normalizeFrenchElision(text);

	return fullWordsByElision.get(elision);
}

/**
 * Get a full word's elision for sentence answers that leave out the apostrophe.
 */
export function getFrenchWordElision(text: string): string | undefined {
	const fullWord = text.toLowerCase();

	for (const [elision, fullFrenchWord] of fullWordsByElision) {
		if (fullFrenchWord.toLowerCase() === fullWord) {
			return elision;
		}
	}

	return undefined;
}
