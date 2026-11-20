import colors from '@/src/app/colors';
import {
	getWordProgressDefinitionByKey,
	wordProgressDefinitions,
	type WordProgressKey,
} from '@/src/util/wordProgress';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

interface WordProgressBarProps {
	progress: WordProgressKey;
	labelFormat?: 'initials' | 'words';
	labelFontSize?: number;
	accessibilityLabel?: string;
}

const learningLevels = wordProgressDefinitions.filter(definition => definition.level > 0);

/**
 * Shows each reached level in its own color and marks the current level with a caret.
 */
export default function WordProgressBar({
	progress,
	labelFormat = 'initials',
	labelFontSize = 11,
	accessibilityLabel = 'Word learning level',
}: WordProgressBarProps) {
	/**
	 * Current learning level and caret position
	 */
	const currentLevel = getWordProgressDefinitionByKey(progress);
	const currentSegmentIndex = learningLevels.findIndex(definition => definition.key === progress);
	const currentSegmentCenter = currentSegmentIndex + 0.5;
	const caretWidthFraction = currentSegmentCenter / learningLevels.length;
	const caretLeftPercentage = caretWidthFraction * 100;
	const shouldShowCaret = currentSegmentIndex >= 0;

	/**
	 * Segment colors and labels
	 */
	const labelStyle = {
		fontSize: labelFontSize,
		color: colors.wordProgress.unseen,
	};
	const caretPositionStyle: ViewStyle = {
		left: `${caretLeftPercentage}%`,
		borderBottomColor: colors.wordProgress[currentLevel.key],
	};

	/**
	 * Screen reader progress
	 */
	const accessibilityValue = {
		min: 0,
		max: learningLevels.length,
		now: currentLevel.level,
		text: currentLevel.name,
	};

	return (
		<View
			accessible
			accessibilityRole="progressbar"
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={accessibilityValue}
			style={styles.container}
		>
			<View style={styles.bar}>
				{learningLevels.map((definition, segmentIndex) => {
					const hasReachedLearningLevel = currentLevel.level >= definition.level;
					const isLastSegment = segmentIndex === learningLevels.length - 1;
					const reachedSegmentStyle = {
						backgroundColor: colors.wordProgress[definition.key],
					};
					const reachedLabelStyle = {
						color: colors.wordProgressLight[definition.key],
					};
					let label = definition.name.charAt(0);

					if (labelFormat === 'words') {
						label = definition.name;
					}

					return (
						<View
							key={definition.key}
							style={[
								styles.segment,
								hasReachedLearningLevel && reachedSegmentStyle,
								isLastSegment && styles.lastSegment,
							]}
						>
							<Text
								accessible={false}
								style={[styles.label, labelStyle, hasReachedLearningLevel && reachedLabelStyle]}
							>
								{label}
							</Text>
						</View>
					);
				})}
			</View>
			{shouldShowCaret && (
				<View
					accessible={false}
					pointerEvents="none"
					style={[styles.caret, caretPositionStyle]}
				/>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		position: 'relative',
		alignSelf: 'center',
		width: '100%',
		paddingBottom: 7,
	},
	bar: {
		flexDirection: 'row',
		borderRadius: 4,
		overflow: 'hidden',
		width: '100%',
	},
	segment: {
		flex: 1,
		backgroundColor: colors.utility.cardBorder,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 1,
		borderRightWidth: 1,
		borderColor: colors.light.border,
	},
	lastSegment: {
		borderRightWidth: 0,
	},
	caret: {
		position: 'absolute',
		bottom: 1,
		marginLeft: -3,
		width: 0,
		height: 0,
		borderLeftWidth: 3,
		borderRightWidth: 3,
		borderBottomWidth: 4,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
	},
	label: {
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
});
