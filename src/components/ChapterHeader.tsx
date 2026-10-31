import type { DeckChapter } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import ReadingLink from '@/src/components/ReadingLink';
import { useUserProgress } from '@/src/db/useUserProgress';
import { StyleSheet, Text, View } from 'react-native';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');

/*
 * Typing
 */
interface ChapterHeaderProps {
	chapter: DeckChapter;
	color: string;
}

/*
 * Chapter heading and passage action
 */
export default function ChapterHeader({ chapter, color }: ChapterHeaderProps) {
	const { label, name, description } = chapter;
	const { progressById } = useUserProgress();
	const progress = progressById[chapter.id];
	const completedParagraphCount = progress?.completedParagraphCount ?? 0;
	const paragraphCount = progress?.paragraphCount ?? 0;

	return (
		<View style={styles.header}>
			<View style={styles.headingRow}>
				<View style={styles.heading}>
					<View style={styles.labelRow}>
						<Text
							style={[
								styles.label,
								{
									color,
								},
							]}
						>
							{label}
						</Text>
						<ReadingLink
							item={chapter}
							color={color}
							style={styles.readLink}
						/>
					</View>
					<Text style={styles.title}>{name}</Text>
				</View>
				<BackgroundImage
					source={postmarkImage}
					style={styles.postmark}
				/>
			</View>
			{description && <Text style={styles.description}>{description}</Text>}
			{paragraphCount > 0 && (
				<Text style={styles.progress}>
					{completedParagraphCount} of {paragraphCount} paragraphs solved
				</Text>
			)}
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	header: {
		marginHorizontal: 12,
		paddingBottom: 12,
	},
	headingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 6,
		gap: 2,
	},
	heading: {
		flex: 2,
		minWidth: 0,
		gap: 6,
	},
	labelRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		borderColor: colors.light.goldenBorder,
		gap: 8,
	},
	label: {
		fontFamily: 'lexend-700',
		fontSize: 14,
		textTransform: 'uppercase',
	},
	readLink: {
		fontFamily: 'lexend-400',
		fontSize: 16,
	},
	progress: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-700',
		fontSize: 18,
	},
	description: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: 20,
		marginBottom: 8,
	},
	postmark: {
		flex: 1,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
});
