import type { StorySegment } from '@/src/components/CardDeck/cardDeckTypes';
import {
	getWordRankDefinition,
	type WordProgressKey,
} from '@/src/util/wordRanks';
import { getDB } from '../connection';

/**
 * Typing
 */
export interface GetWordProgressByIdProps {
	userId: string;
	story?: StorySegment[];
}
export type PromiseWordProgressKey = Promise<Record<string, WordProgressKey>>;

/**
 * We want to return an object from this function that looks like this:
 * {
 *  word_pronoun_je: 'unseen',
 *  word_article_le: 'fnew',
 *  word_verb_reveille: 'bronze',
 *  word_noun_reveil: 'silver',
 *  word_verb_conduit: 'gold',
 * }
 */
export default async function getWordProgressById({
	userId,
	story,
}: GetWordProgressByIdProps): PromiseWordProgressKey {
	const result: Record<string, WordProgressKey> = {};
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
		 * If the user has no row for a word yet, then the word
		 * has never been seen.
		 *
		 * Older rows may have correctCount but no seenCount because
		 * we added seenCount later, so a correct answer still means
		 * the word has been seen.
		 */
		for (const wordId of uniqueWordIds) {
			const progress = progressByWordId[wordId];

			if (!progress) {
				result[wordId] = 'unseen';
			} else if (progress.seenCount === 0 && progress.correctCount === 0) {
				result[wordId] = 'unseen';
			} else {
				const wordRankDefinition = getWordRankDefinition(progress.correctCount);

				result[wordId] = wordRankDefinition.key;
			}
		}
	}

	return result;
}
