import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import { leoAndPoeStory } from './leo-and-poe/story';
import { storyAreas } from './storyAreas';
import type { StoryAtlas } from './types';

export type { Chapter, Story, StoryAtlas, StoryCategory } from './types';

/**
 * Collect the active stories for the Atlas.
 */
export const storyAtlas: StoryAtlas = {
	areas: storyAreas,
	stories: [leoAndPoeStory],
};

/**
 * Get every paragraph in story and chapter reading order.
 */
export function getParagraphs(atlas: StoryAtlas = storyAtlas): Paragraph[] {
	return atlas.stories.flatMap(story => story.chapters.flatMap(chapter => chapter.paragraphs));
}
