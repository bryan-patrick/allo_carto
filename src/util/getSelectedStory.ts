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
}

/**
 * We use the same story for the fixed header and the chapters underneath it.
 */
export function getSelectedStory({ selectedStoryId, progressById }: GetSelectedStoryProps) {
	const availableStories = storyAtlas.stories.filter(
		story =>
			hasStoryContent(story) &&
			isItemUnlocked({
				id: story.id,
				progressById,
			}),
	);

	return availableStories.find(story => story.id === selectedStoryId) ?? availableStories[0];
}
