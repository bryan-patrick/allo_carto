import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import ChapterPostcard from '@/src/components/ChapterPostcard';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findAtlasLocationByChapterId } from '@/src/util/atlasCompletion';
import { hasChapterContent } from '@/src/util/atlasContent';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from '../MaterialSymbol';

const pageBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

/*
 * The chapter details view (shows chapter and paragraph details)
 */
export default function ChapterDetailView() {
	const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();
	const { progressById, status } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const scrollContentStyle = { paddingTop: headerHeight + 16 };
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
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={{ top: headerHeight }}
			>
				<MaterialSymbol
					color={colors.dark.text}
					size={32}
					name="raven"
				/>
				<View style={styles.chapterHeading}>
					<Text style={styles.chapterTitle}>{chapter.name}</Text>
					{chapter.description && (
						<Text style={styles.chapterDescription}>{chapter.description}</Text>
					)}
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
		marginTop: 24,
	},
	storyMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	readStoryLink: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		color: colors.light.goldenBorder,
	},
	chapterHeading: {
		gap: 8,
		paddingHorizontal: 12,
		marginBottom: 16,
	},
	chapterTitle: {
		fontFamily: 'lexend-600',
		fontSize: 22,
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
		textAlign: 'center',
		color: colors.dark.text,
	},
});
