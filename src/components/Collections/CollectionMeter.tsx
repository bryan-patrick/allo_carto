import colors from '@/src/app/colors';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { StyleSheet, Text, View } from 'react-native';

interface CollectionMeterProps {
	qualifyingWordCount: number;
	wordCount: number;
	targetLevel: number;
	learningLevel: WordProgressKey;
}

/*
 * Shows how many stamps have reached the learning level needed for the next reward.
 */
export default function CollectionMeter({
	qualifyingWordCount,
	wordCount,
	targetLevel,
	learningLevel,
}: CollectionMeterProps) {
	const percentage = wordCount > 0 ? (qualifyingWordCount / wordCount) * 100 : 0;
	const fillWidth = `${percentage}%` as const;
	const fillStyle = {
		width: fillWidth,
		backgroundColor: colors.wordProgress[learningLevel],
	};
	const progressLabel = `${qualifyingWordCount} / ${wordCount} at Lvl. ${targetLevel}`;

	return (
		<View
			accessible
			accessibilityLabel={`${qualifyingWordCount} of ${wordCount} words at learning level ${targetLevel} or higher.`}
			style={styles.container}
		>
			<View style={styles.track}>
				<View style={[styles.fill, fillStyle]} />
			</View>
			<Text style={styles.label}>{progressLabel}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 5,
	},
	track: {
		height: 9,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 6,
		backgroundColor: colors.light.secondary,
		overflow: 'hidden',
	},
	fill: {
		height: '100%',
		borderRadius: 6,
	},
	label: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		color: colors.wordProgress.unseen,
	},
});
