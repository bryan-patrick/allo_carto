import type { DeckChapter } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import type { ProgressById } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');

/*
 * Typing
 */
interface ChapterHeaderProps {
	chapter: DeckChapter;
	progressById: ProgressById;
}

// Show solved paragraph progress beside the postcard's postmark and stamp.
export default function ChapterHeader({ chapter, progressById }: ChapterHeaderProps) {
	const progress = progressById[chapter.id];
	const completedParagraphCount = progress?.completedParagraphCount ?? 0;
	const paragraphCount = progress?.paragraphCount ?? 0;

	return (
		<View style={styles.header}>
			<View style={styles.heading}>
				{paragraphCount > 0 && (
					<Text style={styles.progress}>
						{completedParagraphCount} of {paragraphCount} paragraphs solved
					</Text>
				)}
			</View>
			<BackgroundImage
				accessible={false}
				source={postmarkImage}
				resizeMode="contain"
				style={styles.postmark}
			/>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 0,
		gap: 12,
		borderColor: colors.light.goldenBorder,
	},
	heading: {
		flex: 1,
	},
	progress: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 14,
		color: colors.dark.text,
	},
	postmark: {
		flex: 1,
		maxWidth: 120,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
});
