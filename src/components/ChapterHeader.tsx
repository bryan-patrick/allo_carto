import type { DeckChapter } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
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
	const seenWordCount = progress?.seenWordCount ?? 0;
	const wordCount =
		progress?.wordCount ?? new Set(chapter.decks.flatMap(deck => deck.wordIds)).size;
	const learnedPercent = Math.floor(progress?.completionPercentage ?? 0);
	const seenText = `${seenWordCount}/${wordCount}`;
	const learnedText = `${learnedPercent}%`;
	const progressLabel = `${seenWordCount} of ${wordCount} words seen, ${learnedPercent} percent learned`;
	const hasWords = wordCount > 0;

	return (
		<View style={styles.header}>
			<View style={styles.headingRow}>
				<View style={styles.heading}>
					<View style={styles.labelRow}>
						<Text style={[styles.label, { color }]}>{label}</Text>
						{hasWords && (
							<View
								accessible
								accessibilityLabel={progressLabel}
								style={styles.progressRow}
							>
								<View style={styles.progressItem}>
									<MaterialSymbol
										color={colors.dark.text}
										name="cards_star"
										size={12}
									/>
									<Text style={styles.progressText}>{seenText}</Text>
								</View>
								<View style={styles.progressItem}>
									<MaterialSymbol
										color={colors.dark.text}
										name="cognition_2"
										size={12}
									/>
									<Text style={styles.progressText}>{learnedText}</Text>
								</View>
							</View>
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
	progressRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginHorizontal: 4,
	},
	progressItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	progressText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 10,
	},
	label: {
		fontFamily: 'lexend-700',
		fontSize: 12,
		textTransform: 'uppercase',
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-700',
		fontSize: 16,
	},
	description: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 18,
		marginBottom: 8,
	},
	postmark: {
		flex: 1,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
});
