import type { DeckChapter } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import CollectionProgress from '@/src/components/CollectionProgress';
import ReadingDescription from '@/src/components/ReadingDescription';
import { useUserProgress } from '@/src/db/useUserProgress';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');

/**
 * Typing
 */
interface ChapterHeaderProps {
	chapter: DeckChapter;
	color: string;
}

/**
 * Chapter heading and passage action
 */
export default function ChapterHeader({ chapter, color }: ChapterHeaderProps) {
	const { label, name, description } = chapter;
	const { progressById } = useUserProgress();
	const progress = progressById[chapter.id];
	const wordCount =
		progress?.wordCount ?? new Set(chapter.decks.flatMap(deck => deck.wordIds)).size;
	const hasWords = wordCount > 0;

	return (
		<View style={styles.header}>
			<View style={styles.headingRow}>
				<View style={styles.heading}>
					<View style={styles.labelRow}>
						<Text style={[styles.label, { color }]}>{label}</Text>
						{hasWords && (
							<CollectionProgress
								progress={progress}
								wordCount={wordCount}
								color={color}
								fontSize={14}
							/>
						)}
					</View>
					<Text style={styles.title}>{name}</Text>
				</View>
				<ImageBackground
					source={postmarkImage}
					style={styles.postmark}
				/>
			</View>
			{description && (
				<ReadingDescription
					item={chapter}
					color={color}
					style={styles.description}
				/>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	header: {
		marginHorizontal: 8,
		paddingBottom: 4,
	},
	headingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 4,
		gap: 2,
	},
	heading: {
		flex: 2,
		minWidth: 0,
		gap: 4,
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
