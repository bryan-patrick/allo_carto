import ChapterMap from '@/src/components/ChapterMap';
import Loader from '@/src/components/Loader';
import RepeatingBackgroundImage from '@/src/components/RepeatingBackgroundImage';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getSelectedStory } from '@/src/util/getSelectedStory';
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
		<ScrollView
			key={selectedStory.id}
			style={styles.background}
			contentContainerStyle={styles.scrollContent}
		>
			<RepeatingBackgroundImage
				source={chapterSelectBackground}
				style={styles.scrollContentContainer}
			>
				<ChapterMap
					key={selectedStory.id}
					story={selectedStory}
					progressById={progressById}
				/>
			</RepeatingBackgroundImage>
		</ScrollView>
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
	scrollContent: {
		flexGrow: 1,
	},
	scrollContentContainer: {
		flexGrow: 1,
		paddingHorizontal: 4,
		paddingVertical: 24,
	},
});
