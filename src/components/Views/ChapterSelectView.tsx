import { chapterSelectBackground } from '@/data/french/storyAtlas';
import ChapterMap from '@/src/components/ChapterMap';
import Loader from '@/src/components/Loader';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { ImageBackground, ScrollView, StyleSheet, Text } from 'react-native';
import colors from '../../app/colors';

/** Home shows the chapters for the story chosen in its fixed header. */
export default function ChapterSelectView() {
	const { progressById, status } = useUserProgress();
	const user = useUserContext();
	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
	});

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return <Text>Could not load chapter progress.</Text>;
	}

	if (!selectedStory) {
		return <Text>No stories are available yet.</Text>;
	}

	return (
		<ImageBackground
			style={styles.background}
			source={selectedStory.image ?? chapterSelectBackground}
		>
			<ScrollView
				key={selectedStory.id}
				contentContainerStyle={styles.scrollContentContainer}
				style={styles.scrollView}
			>
				<ChapterMap
					key={selectedStory.id}
					story={selectedStory}
					progressById={progressById}
				/>
			</ScrollView>
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.dark.background,
	},
	scrollContentContainer: {
		flexGrow: 1,
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	scrollView: {
		backgroundColor: 'rgba(35, 35, 30, 0.25)',
	},
});
