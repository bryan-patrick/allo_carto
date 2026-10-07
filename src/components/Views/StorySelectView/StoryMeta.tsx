import colors from '@/src/app/colors';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

/**
 * Typing
 */
interface StoryMetaProps {
	progressPercent: number;
	progressColor: string;
	seenWordCount: number;
	wordCount: number;
}

interface StoryProgressProps {
	color: string;
	label: string;
	percent: number;
	value: string;
}

/**
 * A progress label and its progress bar
 */
function StoryProgress({ color, label, percent, value }: StoryProgressProps) {
	const trackStyle = { backgroundColor: `${color}20` };
	const progressStyle: ViewStyle = { backgroundColor: color, width: `${percent}%` };

	return (
		<View style={styles.progressColumn}>
			<Text style={styles.metaText}>
				{value} {label}
			</Text>
			<View style={[styles.progressBarContainer, trackStyle]}>
				<View style={[styles.progressBar, progressStyle]} />
			</View>
		</View>
	);
}

/**
 * Story knowledge and distinct words encountered.
 */
export default function StoryMeta({
	progressPercent,
	progressColor = '#08433f',
	seenWordCount,
	wordCount,
}: StoryMetaProps) {
	const displayProgressPercent = Math.floor(progressPercent);
	const knownValue = `${displayProgressPercent}%`;
	const seenValue = `${seenWordCount}/${wordCount}`;
	const accessibilityLabel = `${seenWordCount} of ${wordCount} words seen, ${displayProgressPercent} percent learned`;
	let seenPercent = 0;

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
				label="seen"
				percent={seenPercent}
				value={seenValue}
			/>
			<View style={styles.metaDivider} />
			<StoryProgress
				color={progressColor}
				label="learned"
				percent={displayProgressPercent}
				value={knownValue}
			/>
		</View>
	);
}

/**
 * Styles
 */
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
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 4,
		height: 6,
	},
	progressBar: {
		height: '100%',
	},
});
