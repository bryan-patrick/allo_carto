import type { Story } from '@/data/french/storyAtlas';
import ChapterMap from '@/src/components/ChapterMap';
import Loader from '@/src/components/Loader';
import StorySelectModal from '@/src/components/StorySelectModal';
import StorySelector from '@/src/components/StorySelector';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { useState } from 'react';
import { Alert, Animated, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import colors from '../../app/colors';

const chapterSelectBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

/**
 * Shows the story picker and chapter map with a parallax background
 */
export default function ChapterSelectView() {
	/**
	 * Saved progress and motion preference
	 */
	const { progressById, status } = useUserProgress();
	const user = useUserContext();
	const isReducedMotionEnabled = useReducedMotion();

	/**
	 * Story picker state
	 */
	const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
	const [isSelectingStory, setIsSelectingStory] = useState(false);
	const [storyTabHeight, setStoryTabHeight] = useState(44);

	/**
	 * Scroll position and page sizes
	 */
	const [scrollOffset] = useState(() => new Animated.Value(0));
	const [viewportHeight, setViewportHeight] = useState(0);
	const [scrollContentHeight, setScrollContentHeight] = useState(0);
	const maximumScrollDistance = Math.max(scrollContentHeight - viewportHeight, 1);
	const backgroundScrollDistance = Math.min(maximumScrollDistance, viewportHeight);
	const handleScroll = Animated.event(
		[
			{
				nativeEvent: {
					contentOffset: {
						y: scrollOffset,
					},
				},
			},
		],
		{
			useNativeDriver: true,
		},
	);

	/**
	 * Selected story and background movement
	 */
	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
	});
	const chapterContentInsetStyle = {
		paddingTop: storyTabHeight + 8,
	};
	let backgroundTravel = 0;

	if (!isReducedMotionEnabled && scrollContentHeight > viewportHeight) {
		backgroundTravel = backgroundScrollDistance * 0.2;
	}

	/**
	 * The extra image height keeps the background covered while it moves.
	 */
	const backgroundImageStyle = {
		height: viewportHeight + backgroundTravel,
		transform: [
			{
				translateY: scrollOffset.interpolate({
					inputRange: [0, maximumScrollDistance],
					outputRange: [0, -backgroundTravel],
					extrapolate: 'clamp',
				}),
			},
		],
	};

	/**
	 * Leaves room for the story picker when its title wraps onto another line.
	 */
	function handleStoryPickerLayout(event: LayoutChangeEvent) {
		const { height } = event.nativeEvent.layout;

		setStoryTabHeight(height);
	}

	/**
	 * Saves the selected story and closes the story picker.
	 */
	async function handleSelectStory(story: Story) {
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
			<View
				onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
				style={styles.background}
			>
				<Animated.Image
					accessible={false}
					pointerEvents="none"
					source={chapterSelectBackground}
					resizeMode="cover"
					style={[styles.backgroundImage, backgroundImageStyle]}
				/>
				<Animated.ScrollView
					key={selectedStory.id}
					bounces={false}
					overScrollMode="never"
					onScroll={handleScroll}
					scrollEventThrottle={16}
					onContentSizeChange={(_contentWidth, contentHeight) =>
						setScrollContentHeight(contentHeight)
					}
					style={styles.chapterList}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={[styles.chapterContent, chapterContentInsetStyle]}>
						<View style={styles.readStoryAction}>
							{/* <ReadingLink
								item={selectedStory}
								color={colors.category[selectedStory.category]}
								label="Read story"
								style={styles.readStoryLink}
							/> */}
						</View>
						<ChapterMap
							key={selectedStory.id}
							story={selectedStory}
							progressById={progressById}
						/>
					</View>
				</Animated.ScrollView>
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

/**
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
	readStoryAction: {
		alignItems: 'center',
		marginVertical: 12,
	},
	readStoryLink: {
		fontSize: 14,
		lineHeight: 20,
	},
	background: {
		flex: 1,
		backgroundColor: colors.light.secondary,
		overflow: 'hidden',
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
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
