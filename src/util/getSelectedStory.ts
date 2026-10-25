import { storyAtlas } from '@/data/french/storyAtlas';
import { isItemUnlocked } from './atlasCompletion';
import { hasStoryContent } from './atlasContent';
import type { ProgressById } from './progression';

/**
 * Typing
 */
interface GetSelectedStoryProps {
	selectedStoryId?: string | null;
	progressById: ProgressById;
	userLevel: number;
}

/**
 * We use the same story for the fixed header and the chapters underneath it.
 */
export function getSelectedStory({
	selectedStoryId,
	progressById,
	userLevel,
}: GetSelectedStoryProps) {
	const availableStories = storyAtlas.stories.filter(
		story => hasStoryContent(story) && isItemUnlocked({ id: story.id, progressById, userLevel }),
	);

	return availableStories.find(story => story.id === selectedStoryId) ?? availableStories[0];
}
