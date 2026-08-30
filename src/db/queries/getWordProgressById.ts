import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';
import { getWordProgressKeyFromCounts, type WordProgressKey } from '@/src/util/wordProgress';
import { getDB } from '../connection';

/**
 * Typing
 */
export interface GetWordProgressByIdProps {
	userId: string;
	passage?: PassageSegment[];
}
export type PromiseWordProgressKey = Promise<Record<string, WordProgressKey>>;

/**
 * We want to return an object from this function that looks like this:
 * {
 *  word_pronoun_je: 'unseen',
 *  word_article_le: 'new',
 *  word_verb_reveille: 'learning',
 *  word_noun_reveil: 'familiar',
 *  word_verb_conduit: 'known',
 * }
 */
export default async function getWordProgressById({
	userId,
	passage,
}: GetWordProgressByIdProps): PromiseWordProgressKey {
	const result: Record<string, WordProgressKey> = {};
	const wordIdsFromPassage: string[] = [];

	/**
	 * The passage is the source of truth.
	 * Pull the word ids directly from the passage segments.
	 */
	if (passage) {
		for (const passageSegment of passage) {
			if (passageSegment.wordId) {
				wordIdsFromPassage.push(passageSegment.wordId);
			}
		}
	}

	/**
	 * A passage can use the same word more than once.
	 * We only need to ask SQLite about each word once.
	 */
	const uniqueWordIdsSet = new Set(wordIdsFromPassage);
	const uniqueWordIds = Array.from(uniqueWordIdsSet);
	const progressByWordId: Record<
		string,
		{
			correctCount: number;
			seenCount: number;
		}
	> = {};

	if (uniqueWordIds.length > 0) {
		const database = await getDB();
		const quests = uniqueWordIds.map(() => '?').join(',');

		/**
		 * Get all of the user's
		 * scores for these words
		 * in one query.
		 */
		const userWordProgressRows = await database.getAllAsync<{
			wordId: string;
			correctCount: number;
			seenCount: number;
		}>(
			`
			SELECT wordId, correctCount, seenCount
			FROM userWords
			WHERE userId = ?
				AND wordId IN (${quests});
			`,
			userId,
			...uniqueWordIds,
		);

		/**
		 * Turn the database rows into an object lookup.
		 * This makes the next loop simple.
		 */
		for (const userWordProgressRow of userWordProgressRows) {
			progressByWordId[userWordProgressRow.wordId] = {
				correctCount: userWordProgressRow.correctCount,
				seenCount: userWordProgressRow.seenCount,
			};
		}

		/**
		 * Make sure every requested word id gets a progress key.
		 *
		 * Use the stored userWords counts to get each word's progress.
		 */
		for (const wordId of uniqueWordIds) {
			result[wordId] = getWordProgressKeyFromCounts(progressByWordId[wordId] ?? {});
		}
	}

	return result;
}
