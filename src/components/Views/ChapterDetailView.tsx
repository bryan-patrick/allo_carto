import { chapterSelectBackground } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import ChapterPostcard from '@/src/components/ChapterPostcard';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findAtlasLocationByChapterId } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * The chapter details view (shows chapter and paragraph details)
 */
export default function ChapterDetailView() {
	const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();
	const { experience, progressById, status } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const scrollContentStyle = { paddingTop: headerHeight + 16 };
	const location = findAtlasLocationByChapterId(chapterId);

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return <Text>Could not load chapter progress.</Text>;
	}

	if (!location) {
		return (
			<View style={[styles.background, scrollContentStyle]}>
				<Text style={styles.storyTitle}>Unknown chapter</Text>
				<Text style={styles.message}>Please go back and select a chapter.</Text>
			</View>
		);
	}

	const { chapter, story } = location;

	return (
		<ImageBackground
			source={story.image ?? chapterSelectBackground}
			style={styles.background}
		>
			<ScrollView
				key={chapter.id}
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={{ top: headerHeight }}
				style={styles.scrollView}
			>
				<Text style={styles.storyTitle}>{story.name}</Text>
				<ChapterPostcard
					chapter={chapter}
					story={story}
					progressById={progressById}
					userLevel={experience.level}
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
	scrollView: {
		backgroundColor: 'rgba(35, 35, 30, 0.25)',
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 8,
		paddingBottom: 32,
		gap: 24,
	},
	storyTitle: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		textAlign: 'center',
		color: colors.light.background,
	},
	message: {
		fontFamily: 'lexend-400',
		textAlign: 'center',
		color: colors.light.goldenBorder,
	},
});
