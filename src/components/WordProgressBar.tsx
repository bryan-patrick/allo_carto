import colors from '@/src/app/colors';
import {
	getWordProgressDefinitionByKey,
	wordProgressDefinitions,
	type WordProgressKey,
} from '@/src/util/wordProgress';
import { StyleSheet, Text, View } from 'react-native';

interface WordProgressBarProps {
	progress: WordProgressKey;
	labelFormat?: 'initials' | 'words';
	labelFontSize?: number;
	accessibilityLabel?: string;
}

const learningLevels = wordProgressDefinitions.filter(definition => definition.level > 0);

/*
 * Show learning levels as pill segments
 */
export default function WordProgressBar({
	progress,
	labelFormat = 'initials',
	labelFontSize = 11,
	accessibilityLabel = 'Word learning level',
}: WordProgressBarProps) {
	const currentLevel = getWordProgressDefinitionByKey(progress);
	const accessibilityValue = {
		min: 0,
		max: learningLevels.length,
		now: currentLevel.level,
		text: currentLevel.name,
	};
	const noBorderRight = { borderRightWidth: 0 };

	return (
		<View
			accessible
			accessibilityRole="progressbar"
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={accessibilityValue}
			style={styles.bar}
		>
			{learningLevels.map((definition, i) => {
				const hasReachedLevel = currentLevel.level >= definition.level;
				const segmentStyle = {
					backgroundColor:
						hasReachedLevel ? colors.wordProgress[definition.key] : colors.utility.cardBorder,
				};
				const labelStyle = {
					fontSize: labelFontSize,
					color:
						hasReachedLevel ? colors.wordProgressLight[definition.key] : colors.wordProgress.unseen,
				};
				const label = labelFormat === 'words' ? definition.name : definition.name.charAt(0);
				const isLastItem = i === learningLevels.length - 1;

				return (
					<View
						key={definition.key}
						style={[styles.segment, segmentStyle, isLastItem ? noBorderRight : null]}
					>
						<Text
							accessible={false}
							style={[styles.label, labelStyle]}
						>
							{label}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	bar: {
		flexDirection: 'row',
		alignSelf: 'center',
		borderRadius: 4,
		overflow: 'hidden',
		width: '100%',
	},
	segment: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 1,
		borderRightWidth: 1,
		borderColor: colors.light.border,
	},
	label: {
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
});
