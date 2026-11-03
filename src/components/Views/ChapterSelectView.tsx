import type { DeckStory } from '@/data/french/storyAtlas';
import ChapterMap from '@/src/components/ChapterMap';
import Loader from '@/src/components/Loader';
import RepeatingBackgroundImage from '@/src/components/RepeatingBackgroundImage';
import StorySelectModal from '@/src/components/StorySelectModal';
import StorySelector from '@/src/components/StorySelector';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import colors from '../../app/colors';

const chapterSelectBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

// Keep the story picker above the scrolling chapter map and save the player's story choice.
export default function ChapterSelectView() {
	const { progressById, status } = useUserProgress();
	const user = useUserContext();
	const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
	const [isSelectingStory, setIsSelectingStory] = useState(false);
	const [storyTabHeight, setStoryTabHeight] = useState(44);
	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
	});
	const chapterContentInsetStyle = {
		paddingTop: storyTabHeight + 24,
	};

	// Leave room for the tab even when a long story title wraps onto another line.
	function handleStoryPickerLayout(event: LayoutChangeEvent) {
		const { height } = event.nativeEvent.layout;

		setStoryTabHeight(height);
	}

	async function handleSelectStory(story: DeckStory) {
		let didSave = false;

		if (
			!user ||
			isSelectingStory ||
			!isItemUnlocked({
				id: story.id,
				progressById,
			})
		) {
			return;
		}

		setIsSelectingStory(true);
		didSave = await user.selectStory(story.id);
		setIsSelectingStory(false);

		if (!didSave) {
			Alert.alert('Story not selected', 'Could not save your story choice. Please try again.');
			return;
		}

		setIsStoryModalVisible(false);
	}

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
		<>
			<View style={styles.background}>
				<ScrollView
					key={selectedStory.id}
					bounces={false}
					overScrollMode="never"
					style={styles.chapterList}
					contentContainerStyle={styles.scrollContent}
				>
					<RepeatingBackgroundImage
						source={chapterSelectBackground}
						style={[styles.chapterContent, chapterContentInsetStyle]}
					>
						<ChapterMap
							key={selectedStory.id}
							story={selectedStory}
							progressById={progressById}
						/>
					</RepeatingBackgroundImage>
				</ScrollView>
				<View
					pointerEvents="box-none"
					onLayout={handleStoryPickerLayout}
					style={styles.storyPicker}
				>
					<StorySelector
						story={selectedStory}
						isExpanded={isStoryModalVisible}
						onPress={() => setIsStoryModalVisible(true)}
					/>
				</View>
			</View>
			<StorySelectModal
				visible={isStoryModalVisible}
				onRequestClose={() => setIsStoryModalVisible(false)}
				onSelect={handleSelectStory}
				isSelecting={isSelectingStory}
			/>
		</>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	storyPicker: {
		alignItems: 'center',
		paddingHorizontal: 12,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	background: {
		flex: 1,
		backgroundColor: colors.dark.background,
		overflow: 'hidden',
	},
	chapterList: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	chapterContent: {
		flexGrow: 1,
		paddingHorizontal: 4,
		paddingBottom: 24,
	},
});
