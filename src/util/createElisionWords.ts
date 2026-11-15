import type { Word } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Add each word's short apostrophe form.
 * A shared lemma makes the full and short forms appear under Other forms (I hope).
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
		});
	}

	return libraryWords;
}
