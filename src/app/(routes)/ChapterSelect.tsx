import Loader from '@/src/components/Loader';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findStoryById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { hasStoryContent } from '@/src/util/atlasContent';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text } from 'react-native';

/*
 *
 */
export default function ChapterSelect() {
	const { storyId } = useLocalSearchParams<{ storyId?: string }>();
	const { selectStory } = useUserContext() ?? {};
	const { progressById, status } = useUserProgress();
	const router = useRouter();

	useEffect(() => {
		if (status !== 'ready' || !selectStory) {
			return;
		}

		async function openHome(saveStoryChoice: (id: string) => Promise<boolean>) {
			const story = findStoryById(storyId);

			if (
				story &&
				hasStoryContent(story) &&
				isItemUnlocked({
					id: story.id,
					progressById,
				})
			) {
				const didSave = await saveStoryChoice(story.id);

				if (!didSave) {
					Alert.alert('Story not selected', 'Could not save your story choice. Please try again.');
				}
			}

			router.dismissTo('/(tabs)');
		}

		openHome(selectStory);
	}, [storyId, selectStory, progressById, status, router]);

	if (status === 'error') {
		return <Text>Could not load story progress.</Text>;
	}

	return <Loader />;
}
