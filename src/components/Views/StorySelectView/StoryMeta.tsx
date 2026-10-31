import colors from '@/src/app/colors';
import ProgressBar from '@/src/components/ProgressBar';
import { StyleSheet, Text, View } from 'react-native';

interface StoryMetaProps {
	progressColor: string;
	completedParagraphCount: number;
	paragraphCount: number;
	seenWordCount: number;
	wordCount: number;
}

interface StoryProgressProps {
	color: string;
	label: string;
	percent: number;
	value: string;
}

function StoryProgress({ color, label, percent, value }: StoryProgressProps) {
	const trackStyle = {
		backgroundColor: `${color}20`,
	};

	return (
		<View style={styles.progressColumn}>
			<Text style={styles.metaText}>
				{value} {label}
			</Text>
			<ProgressBar
				color={color}
				percent={percent}
				style={[styles.progressBarContainer, trackStyle]}
			/>
		</View>
	);
}

/*
 * Solved paragraphs show how far the player has moved through the story.
 * Words seen are still useful, but they do not count as completed puzzles.
 */
export default function StoryMeta({
	progressColor,
	completedParagraphCount,
	paragraphCount,
	seenWordCount,
	wordCount,
}: StoryMetaProps) {
	const solvedValue = `${completedParagraphCount}/${paragraphCount}`;
	const seenValue = `${seenWordCount}/${wordCount}`;
	const accessibilityLabel = `${completedParagraphCount} of ${paragraphCount} paragraphs solved, ${seenWordCount} of ${wordCount} words seen`;
	let solvedPercent = 0;
	let seenPercent = 0;

	if (paragraphCount > 0) {
		solvedPercent = (completedParagraphCount / paragraphCount) * 100;
	}

	if (wordCount > 0) {
		seenPercent = (seenWordCount / wordCount) * 100;
	}

	return (
		<View
			accessible
			accessibilityLabel={accessibilityLabel}
			style={styles.metaRow}
		>
			<StoryProgress
				color={progressColor}
				label="paragraphs"
				percent={solvedPercent}
				value={solvedValue}
			/>
			<View style={styles.metaDivider} />
			<StoryProgress
				color={progressColor}
				label="words seen"
				percent={seenPercent}
				value={seenValue}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	metaRow: {
		flexDirection: 'row',
		gap: 12,
	},
	progressColumn: {
		flex: 1,
		minWidth: 0,
		gap: 4,
	},
	metaText: {
		color: colors.dark.text,
		fontSize: 12,
		fontFamily: 'lexend-400',
	},
	metaDivider: {
		backgroundColor: colors.light.border,
		width: 1,
	},
	progressBarContainer: {
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 4,
		height: 6,
	},
});
