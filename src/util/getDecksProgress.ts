import type { DeckChapter } from '@/data/french/deckAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
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

interface DecksProgressPercentProps {
	decks: CardDeck[];
	userId: string;
}

/**
 * Get the user's progress across a collection of decks.
 */
export async function getDecksProgress({
	decks,
	userId,
}: DecksProgressPercentProps): Promise<number> {
	let result = 0;
	const wordIds: string[] = [];

	/**
	 * A word should only count once when it appears in more than one deck.
	 */
	for (const deck of decks) {
		for (const wordId of deck.wordIds) {
			if (!wordIds.includes(wordId)) wordIds.push(wordId);
		}
	}

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

/**
 * Get the user's progress through one chapter.
 */
export default async function getChapterProgressPercent({
	chapter,
	userId,
}: ChapterProgressPercentProps): Promise<number> {
	return getDecksProgress({
		decks: chapter.places.flatMap(place => place.decks),
		userId,
	});
}
