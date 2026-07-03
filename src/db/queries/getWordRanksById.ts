import type { StorySegment } from '@/src/components/CardDeck/cardDeckTypes';
import { getWordRankDefinition, type WordRankKey } from '@/src/util/wordRanks';
import { getDB } from '../connection';

/**
 * Typing
 */
export interface GetWordRanksByIdProps {
	userId: string;
	story?: StorySegment[];
}
export type PromiseWordRankKey = Promise<Record<string, WordRankKey>>;

/**
 * We want to return an object from this function that looks like this:
 * {
 *  word_pronoun_je: 'fnew',
 *  word_verb_reveille: 'bronze',
 *  word_noun_reveil: 'silver',
 *  word_verb_conduit: 'gold',
 * }
 */
export default async function getWordRanksById({
	userId,
	story,
}: GetWordRanksByIdProps): PromiseWordRankKey {
	const result: Record<string, WordRankKey> = {};
	const wordIdsFromStory: string[] = [];

	/**
	 * The story is the source of truth.
	 * Pull the word ids directly from the story segments.
	 */
	if (story) {
		for (const storySegment of story) {
			if (storySegment.wordId) {
				wordIdsFromStory.push(storySegment.wordId);
			}
		}
	}

	/**
	 * A story can use the same word more than once.
	 * We only need to ask SQLite about each word once.
	 */
	const uniqueWordIdsSet = new Set(wordIdsFromStory);
	const uniqueWordIds = Array.from(uniqueWordIdsSet);
	const correctCountByWordId: Record<string, number> = {};

	if (uniqueWordIds.length > 0) {
		const database = await getDB();
		const quests = uniqueWordIds.map(() => '?').join(',');

		/**
		 * Get all of the user's
		 * scores for these words
		 * in one query.
		 */
		const userWordRankRows = await database.getAllAsync<{
			wordId: string;
			correctCount: number;
		}>(
			`
			SELECT wordId, correctCount
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
		for (const userWordRankRow of userWordRankRows) {
			correctCountByWordId[userWordRankRow.wordId] =
				userWordRankRow.correctCount;
		}

		/**
		 * Make sure every requested word id gets a rank.
		 * If the user has no row for a word yet,
		 * its correct count is zero.
		 */
		for (const wordId of uniqueWordIds) {
			const correctCountForThisWord = correctCountByWordId[wordId] ?? 0;
			const wordRankDefinition = getWordRankDefinition(correctCountForThisWord);

			result[wordId] = wordRankDefinition.key;
		}
	}

	return result;
}
