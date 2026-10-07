import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface CompletionStepIndicatorProps {
	step: number;
	total: number;
}

/**
 * Show the current page and the total number of review pages.
 */
export default function CompletionStepIndicator({ step, total }: CompletionStepIndicatorProps) {
	const pageNumber = step + 1;
	const pageLabel = `Page ${pageNumber} / ${total}`;
	const accessibilityLabel = `Completion review, page ${pageNumber} of ${total}`;

	return (
		<View
			accessible
			accessibilityLabel={accessibilityLabel}
			style={styles.row}
		>
			<Text style={styles.label}>{pageLabel}</Text>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	label: {
		fontFamily: 'azeret-mono-400',
		fontSize: 11,
		color: colors.dark.text,
	},
});
