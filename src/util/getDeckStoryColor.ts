import { storyAtlas, type StoryAtlas } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';

/**
 * Use the parent story's category color for a deck.
 */
export function getDeckStoryColor(
	deckId: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): string {
	if (!deckId) return colors.dark.primary;

	for (const story of atlas.stories) {
		if (story.chapters.some(chapter => chapter.decks.some(deck => deck.id === deckId))) {
			return colors.category[story.category];
		}
	}

	return colors.dark.primary;
}
