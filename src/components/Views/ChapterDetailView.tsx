import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import ChapterPostcard from '@/src/components/ChapterPostcard';
import Loader from '@/src/components/Loader';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import ReadingLink from '@/src/components/ReadingLink';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findAtlasLocationByChapterId } from '@/src/util/atlasCompletion';
import { hasChapterContent } from '@/src/util/atlasContent';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const pageBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

interface ChapterDetailParams extends Record<string, string | string[] | undefined> {
	chapterId?: string;
}

// Show the chapter's introduction above a postcard with its progress and paragraphs.
export default function ChapterDetailView() {
	const { chapterId } = useLocalSearchParams<ChapterDetailParams>();
	const { progressById, status } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const scrollContentStyle = {
		paddingTop: headerHeight + 8,
	};
	const location = findAtlasLocationByChapterId(chapterId);

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
		<BackgroundImage
			source={pageBackground}
			resizeMode="cover"
			style={styles.background}
		>
			<ScrollView
				key={chapter.id}
				contentInsetAdjustmentBehavior="never"
				automaticallyAdjustContentInsets={false}
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={{
					top: headerHeight,
				}}
			>
				<View style={styles.chapterHeading}>
					<MaterialSymbol
						color={colors.dark.text}
						size={32}
						name="raven"
					/>
					<Text style={styles.chapterTitle}>{chapter.label}</Text>
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
				<ChapterPostcard
					chapter={chapter}
					story={story}
					progressById={progressById}
				/>
			</ScrollView>
		</BackgroundImage>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.light.secondary,
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
		gap: 12,
		paddingHorizontal: 12,
		marginBottom: 24,
	},
	chapterTitle: {
		fontFamily: 'lexend-600',
		fontSize: 15,
		textAlign: 'center',
		textTransform: 'uppercase',
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
