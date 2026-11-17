import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import ChapterParagraphList from '@/src/components/ChapterParagraphList';
import CollectionGems from '@/src/components/CollectionGems';
import Loader from '@/src/components/Loader';
import ReadingLink from '@/src/components/ReadingLink';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findAtlasLocationByChapterId } from '@/src/util/atlasCompletion';
import { hasChapterContent, hasParagraphContent } from '@/src/util/atlasContent';
import { getCompletedSolveStages, solveStages } from '@/src/util/solveProgression';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const headingBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

interface ChapterDetailParams extends Record<string, string | string[] | undefined> {
	chapterId?: string;
}

/**
 * Shows a fixed chapter heading above its paragraph postcard carousel.
 */
export default function ChapterDetailView() {
	/**
	 * Chapter progress and screen edges
	 */
	const { chapterId } = useLocalSearchParams<ChapterDetailParams>();
	const { progressById, status } = useUserProgress();
	const safeAreaInsets = useSafeAreaInsets();
	const location = findAtlasLocationByChapterId(chapterId);

	/**
	 * Chapter progress totals
	 */
	const chapterProgress = progressById[location?.chapter.id ?? ''];
	const chapterParagraphs = location?.chapter.paragraphs.filter(hasParagraphContent) ?? [];
	const puzzlesPerParagraph = Object.keys(solveStages).length;
	const puzzleCount = chapterParagraphs.length * puzzlesPerParagraph;
	let solvedPuzzleCount = 0;

	/**
	 * Space around the chapter content
	 */
	const chapterContentStyle = {
		paddingBottom: Math.max(safeAreaInsets.bottom, 12),
	};

	for (const paragraph of chapterParagraphs) {
		solvedPuzzleCount += getCompletedSolveStages(progressById[paragraph.id]);
	}

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return <Text>Could not load chapter progress.</Text>;
	}

	if (!location || !hasChapterContent(location.chapter)) {
		return (
			<View style={[styles.background, chapterContentStyle]}>
				<Text style={styles.chapterTitle}>Unknown chapter</Text>
				<Text style={styles.message}>Please go back and select a chapter.</Text>
			</View>
		);
	}

	const { chapter, story } = location;

	return (
		<View style={styles.background}>
			<View
				key={chapter.id}
				style={[styles.chapterContent, chapterContentStyle]}
			>
				<BackgroundImage
					source={headingBackground}
					resizeMode="cover"
					style={styles.chapterHeading}
				>
					<View style={styles.chapterSummary}>
						<View style={styles.chapterSummaryRow}>
							<Text style={styles.chapterTitle}>{chapter.label}</Text>
							<CollectionGems
								title={chapter.name}
								progress={chapterProgress}
								size={24}
							/>
						</View>
						<View style={styles.chapterSummaryRow}>
							<Text
								accessibilityRole="header"
								style={styles.chapterName}
							>
								{chapter.name}
							</Text>
							<ReadingLink
								item={chapter}
								color={colors.category[story.category]}
								label="Read chapter"
								style={styles.readChapterLink}
							/>
						</View>
					</View>
				</BackgroundImage>
				<View style={styles.chapterDetails}>
					<Text style={styles.chapterProgress}>
						{solvedPuzzleCount} of {puzzleCount} puzzles solved
					</Text>
					{chapter.description && (
						<Text style={styles.chapterDescription}>{chapter.description}</Text>
					)}
				</View>
				<View style={styles.paragraphArea}>
					<ChapterParagraphList
						chapter={chapter}
						story={story}
						progressById={progressById}
					/>
				</View>
			</View>
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
	chapterContent: {
		flex: 1,
	},
	paragraphArea: {
		flex: 1,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderColor: colors.light.goldenBorder,
	},
	readChapterLink: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 20,
	},
	chapterHeading: {
		backgroundColor: colors.light.background,
		gap: 2,
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.border,
		// elevation: 3,
		// shadowColor: colors.dark.background,
		// shadowOffset: {
		// 	width: 0,
		// 	height: 3,
		// },
		// shadowOpacity: 0.12,
		// shadowRadius: 4,
		zIndex: 1,
	},
	chapterSummary: {
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 0,
	},
	chapterSummaryRow: {
		flexDirection: 'row',
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	chapterTitle: {
		flexShrink: 1,
		fontFamily: 'shadows-400',
		fontSize: 28,
		lineHeight: 36,
		color: colors.dark.text,
	},
	chapterDetails: {
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 4,
		borderBottomWidth: 1,
		borderColor: colors.light.goldenBorder,
		gap: 4,
	},
	chapterName: {
		fontFamily: 'lexend-600',
		fontSize: 18,
		lineHeight: 18,
		textAlign: 'center',
		color: colors.dark.text,
	},
	chapterProgress: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 13,
		paddingVertical: 3,
		textAlign: 'center',
		color: colors.dark.text,
	},
	chapterDescription: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 20,
		color: colors.dark.text,
	},
	message: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		textAlign: 'center',
		color: colors.dark.text,
	},
});
