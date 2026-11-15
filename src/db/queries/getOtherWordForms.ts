import { seedWords } from '@/data/french/words';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { getDB } from '../connection';
import type { WordRow } from '../types';

/**
 * Types
 */
export type OtherWordForm = Pick<
	WordRow,
	'lemmaId' | 'frenchWord' | 'frenchArticle' | 'form' | 'tense' | 'gender' | 'partOfSpeech'
>;

/**
 * Get the word's related forms from the current story vocabulary.
 * TODO: This hasn't been working correctly, idk why yet.
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
	return database.getAllAsync<OtherWordForm>(
		`SELECT DISTINCT lemmaId, frenchWord, frenchArticle, form, tense, gender, partOfSpeech
		 FROM words
		 WHERE lemmaId = ? COLLATE BINARY AND id <> ? AND id IN (${placeholders})
		 ORDER BY frenchWord COLLATE NOCASE`,
		lemmaId,
		word.id,
		...wordIds,
	);
}
