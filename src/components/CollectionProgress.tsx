import colors from '@/src/app/colors';
import type { UserProgressRow } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

interface CollectionProgressProps {
	progress?: UserProgressRow;
	wordCount?: number;
	color?: string;
	fontSize?: number;
}

/** We show words seen and learned progress beside chapter and paragraph numbers. */
export default function CollectionProgress({
	progress,
	wordCount = 0,
	color = colors.dark.text,
	fontSize = 12,
}: CollectionProgressProps) {
	const totalWordCount = progress?.wordCount ?? wordCount;
	const seenWordCount = progress?.seenWordCount ?? 0;
	const learnedPercent = Math.floor(progress?.completionPercentage ?? 0);
	const textStyle = { color, fontSize };

	return (
		<View
			accessible
			accessibilityLabel={`${seenWordCount} of ${totalWordCount} words seen, ${learnedPercent} percent learned`}
			style={styles.row}
		>
			<View style={styles.stat}>
				<MaterialSymbol
					name="visibility"
					size={fontSize + 2}
					color={color}
				/>
				<Text style={[styles.value, textStyle]}>
					{seenWordCount}/{totalWordCount}
				</Text>
			</View>
			<View style={styles.stat}>
				<MaterialSymbol
					name="cognition_2"
					size={fontSize + 2}
					color={color}
				/>
				<Text style={[styles.value, textStyle]}>{learnedPercent}%</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 8,
	},
	stat: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	value: {
		fontFamily: 'lexend-400',
	},
});
