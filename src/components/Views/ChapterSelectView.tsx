import ChapterMap from '@/src/components/ChapterMap';
import Loader from '@/src/components/Loader';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { ImageBackground } from 'expo-image';
import { ScrollView, StyleSheet, Text } from 'react-native';
import colors from '../../app/colors';

const chapterSelectBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

/* Home shows the chapters for the story chosen in its fixed header. */
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
			source={chapterSelectBackground}
			contentFit="cover"
			contentPosition="top"
		>
			<ScrollView
				key={selectedStory.id}
				contentContainerStyle={styles.scrollContentContainer}
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

/*
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.dark.background,
		overflow: 'hidden',
	},
	scrollContentContainer: {
		flexGrow: 1,
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
});
