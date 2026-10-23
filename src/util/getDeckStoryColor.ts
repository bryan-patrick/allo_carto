import { storyAtlas, type StoryAtlas } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';

/**
 * Use the story's category color for a story, chapter, or deck passage.
 */
export function getDeckStoryColor(
	deckId: string | undefined,
	atlas: StoryAtlas = storyAtlas,
): string {
	if (!deckId) return colors.dark.primary;

	for (const story of atlas.stories) {
		if (story.id === deckId) return colors.category[story.category];

		if (
			story.chapters.some(
				chapter => chapter.id === deckId || chapter.decks.some(deck => deck.id === deckId),
			)
		) {
			return colors.category[story.category];
		}
	}

	return colors.dark.primary;
}
