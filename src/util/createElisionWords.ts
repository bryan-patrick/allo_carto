import type { Word } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Add each word's elision with its full spelling and shared words.
 */
export function createElisionWords(words: Word[]): Word[] {
	/**
	 * Full words and their related short forms
	 */
	const libraryWords: Word[] = [];

	for (const word of words) {
		const elision = word.elision;
		const lemmaId = word.lemmaId ?? word.id;

		if (!elision) {
			libraryWords.push(word);
			continue;
		}

		libraryWords.push({
			...word,
			lemmaId,
		});
		libraryWords.push({
			...word,
			...elision,
			id: `${word.id}_elision`,
			lemmaId,
			form: 'elision',
			elision: undefined,
			fullFrenchWord: word.frenchWord,
		});
	}

	return libraryWords;
}
