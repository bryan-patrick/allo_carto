import type { DeckChapter } from '@/data/french/deckAtlas';
import getDeckRankCounts, {
	DeckRankCounts,
} from '@/src/db/queries/getDeckRankCounts';
import { getDeckCompletionPercent } from './deckCompletion';

/**
 * Typing
 */
interface ChapterProgressPercentProps {
	chapter: DeckChapter;
	userId: string;
}

/**
 * Get the user's progress through one chapter.
 */
export default async function getChapterProgressPercent({
	chapter,
	userId,
}: ChapterProgressPercentProps): Promise<number> {
	let result = 0;
	const wordIds: string[] = [];

	/**
	 * Push all the unique words into the wordIds array.
	 * A word should only count once when it appears in more than one deck.
	 */
	for (const place of chapter.places) {
		for (const deck of place.decks) {
			for (const wordId of deck.wordIds) {
				if (!wordIds.includes(wordId)) wordIds.push(wordId);
			}
		}
	}

	/**
	 * Empty chapters have no progress to retrieve.
	 */
	if (wordIds.length > 0) {
		const rankCounts: DeckRankCounts = await getDeckRankCounts({
			userId,
			wordIds,
		});

		result = getDeckCompletionPercent({
			deckWordCount: wordIds.length,
			rankCounts,
		});
	}

	return result;
}
