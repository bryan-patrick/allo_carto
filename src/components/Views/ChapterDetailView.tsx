import colors from '@/src/app/colors';
import ChapterParagraphList from '@/src/components/ChapterParagraphList';
import CollectionGems from '@/src/components/CollectionGems';
import Loader from '@/src/components/Loader';
import ReadingLink from '@/src/components/ReadingLink';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findAtlasLocationByChapterId } from '@/src/util/atlasCompletion';
import { hasChapterContent } from '@/src/util/atlasContent';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const pageBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

interface ChapterDetailParams extends Record<string, string | string[] | undefined> {
	chapterId?: string;
}

/**
 * Shows the chapter's paragraph postcards with a parallax background
 */
export default function ChapterDetailView() {
	/**
	 * Chapter progress and motion preference
	 */
	const { chapterId } = useLocalSearchParams<ChapterDetailParams>();
	const { progressById, status } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const isReducedMotionEnabled = useReducedMotion();
	const location = findAtlasLocationByChapterId(chapterId);

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
	 * Background movement and space above the chapter
	 */
	let backgroundTravel = 0;
	const scrollContentStyle = {
		paddingTop: headerHeight + 8,
	};

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

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return <Text>Could not load chapter progress.</Text>;
	}

	if (!location || !hasChapterContent(location.chapter)) {
		return (
			<View style={[styles.background, scrollContentStyle]}>
				<Text style={styles.chapterTitle}>Unknown chapter</Text>
				<Text style={styles.message}>Please go back and select a chapter.</Text>
			</View>
		);
	}

	const { chapter, story } = location;

	return (
		<View
			onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
			style={styles.background}
		>
			<Animated.Image
				accessible={false}
				pointerEvents="none"
				source={pageBackground}
				resizeMode="cover"
				style={[styles.backgroundImage, backgroundImageStyle]}
			/>
			<Animated.ScrollView
				key={chapter.id}
				bounces={false}
				overScrollMode="never"
				contentInsetAdjustmentBehavior="never"
				automaticallyAdjustContentInsets={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				onContentSizeChange={(_contentWidth, contentHeight) =>
					setScrollContentHeight(contentHeight)
				}
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={{
					top: headerHeight,
				}}
			>
				<View style={styles.chapterHeading}>
					<CollectionGems
						title={chapter.name}
						progress={progressById[chapter.id]}
						size={24}
					/>
					<View style={styles.chapterTitles}>
						<Text style={styles.chapterTitle}>{chapter.label}</Text>
						<Text
							accessibilityRole="header"
							style={styles.chapterName}
						>
							{chapter.name}
						</Text>
					</View>
					{chapter.description && (
						<Text style={styles.chapterDescription}>{chapter.description}</Text>
					)}
					<ReadingLink
						item={chapter}
						color={colors.category[story.category]}
						label="Read chapter"
						style={styles.readChapterLink}
					/>
				</View>
				<ChapterParagraphList
					chapter={chapter}
					story={story}
					progressById={progressById}
				/>
			</Animated.ScrollView>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
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
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'flex-start',
		paddingHorizontal: 8,
		paddingBottom: 32,
	},
	readChapterLink: {
		fontFamily: 'lexend-400',
		fontSize: 15,
	},
	chapterHeading: {
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 12,
		marginBottom: 16,
	},
	chapterTitles: {
		alignItems: 'center',
		gap: 4,
	},
	chapterTitle: {
		fontFamily: 'lexend-700',
		fontSize: 15,
		textAlign: 'center',
		textTransform: 'uppercase',
		color: colors.dark.text,
	},
	chapterName: {
		fontFamily: 'lexend-600',
		fontSize: 22,
		lineHeight: 24,
		textAlign: 'center',
		color: colors.dark.text,
	},
	chapterDescription: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: 20,
		textAlign: 'center',
		color: colors.dark.text,
	},
	message: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		textAlign: 'center',
		color: colors.dark.text,
	},
});
