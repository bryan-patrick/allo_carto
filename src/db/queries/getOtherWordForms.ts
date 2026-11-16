import { seedWords } from '@/data/french/words';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { getDB } from '../connection';
import type { WordRow } from '../types';

/**
 * Types
 */
interface OtherWordFormRow extends Pick<
	WordRow,
	| 'lemmaId'
	| 'frenchWord'
	| 'englishWords'
	| 'frenchArticle'
	| 'form'
	| 'tense'
	| 'gender'
	| 'partOfSpeech'
	| 'isQuebecois'
> {}

/**
 * Typing for the related forms shown on a flashcard.
 */
export interface OtherWordForm extends Omit<OtherWordFormRow, 'englishWords' | 'isQuebecois'> {
	englishWords: string[];
	isQuebecois: boolean;
}

/**
 * Reads a related word's French details and English meanings.
 */
function parseOtherWordForm(row: OtherWordFormRow): OtherWordForm {
	const { englishWords, isQuebecois, ...wordDetails } = row;

	return {
		...wordDetails,
		englishWords: JSON.parse(englishWords),
		isQuebecois: Boolean(isQuebecois),
	};
}

/**
 * Loads other forms of the same word from the active vocabulary.
 */
export default async function getOtherWordForms(
	word: Pick<Word, 'id' | 'lemmaId'>,
): Promise<OtherWordForm[]> {
	/**
	 * Active vocabulary and saved word family
	 */
	const { lemmaId } = word;
	const wordIds = seedWords.map(candidate => candidate.id);
	const placeholders = wordIds.map(() => '?').join(',');

	/**
	 * A missing or blank lemma has no related forms
	 */
	if (typeof lemmaId !== 'string' || !lemmaId.trim()) {
		return [];
	}

	const database = await getDB();

	/**
	 * Find related spellings still available in the current word library.
	 */
	const rows = await database.getAllAsync<OtherWordFormRow>(
		`SELECT DISTINCT lemmaId, frenchWord, englishWords, frenchArticle,
		 form, tense, gender, partOfSpeech, isQuebecois
		 FROM words
		 WHERE lemmaId = ? COLLATE BINARY AND id <> ? AND id IN (${placeholders})
		 ORDER BY frenchWord COLLATE NOCASE`,
		lemmaId,
		word.id,
		...wordIds,
	);

	return rows.map(parseOtherWordForm);
}
