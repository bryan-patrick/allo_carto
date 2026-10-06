import type { StoryArea } from '@/data/french/storyAreas';
import type { DeckStory } from '@/data/french/storyAtlas';

/**
 * Stories belong to the area containing their required player level.
 */
export function getStoriesForArea(stories: DeckStory[], area: StoryArea): DeckStory[] {
	return stories.filter(
		story => story.requiredLevel >= area.minLevel && story.requiredLevel <= area.maxLevel,
	);
}

export function formatAreaLevelRange(area: StoryArea): string {
	return `Levels ${area.minLevel}–${area.maxLevel}`;
}

/**
 * Start in the player's current area, while keeping earlier areas accessible.
 */
export function getCurrentStoryArea(areas: StoryArea[], userLevel: number): StoryArea {
	let currentArea = areas[0];

	for (const area of areas) {
		if (userLevel >= area.minLevel) currentArea = area;
	}

	return currentArea;
}
