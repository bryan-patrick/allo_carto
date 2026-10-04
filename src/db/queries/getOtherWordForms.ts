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
 * A helper for the link on the cards to get the other word forms
 */
export default async function getOtherWordForms(
	word: Pick<Word, 'id' | 'lemmaId'>,
): Promise<OtherWordForm[]> {
	const { lemmaId } = word;

	/**
	 * A missing or blank lemma has no related forms
	 */
	if (typeof lemmaId !== 'string' || !lemmaId.trim()) return [];

	const database = await getDB();

	/**
	 * We de-dupe and get our lemma collate
	 */
	return database.getAllAsync<OtherWordForm>(
		`SELECT DISTINCT lemmaId, frenchWord, frenchArticle, form, tense, gender, partOfSpeech
		 FROM words
		 WHERE lemmaId = ? COLLATE BINARY AND id <> ?
		 ORDER BY frenchWord COLLATE NOCASE`,
		lemmaId,
		word.id,
	);
}
