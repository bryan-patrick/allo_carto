import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface CompletionStepIndicatorProps {
	step: number;
	color: string;
}

const steps = [0, 1, 2];

/**
 * Show the current review step with a filled dot and a step number.
 */
export default function CompletionStepIndicator({ step, color }: CompletionStepIndicatorProps) {
	const dots = steps.map(index => {
		let backgroundColor = colors.light.background;
		let borderColor = colors.light.border;

		if (index === step) {
			backgroundColor = color;
			borderColor = color;
		}

		return { index, style: { backgroundColor, borderColor } };
	});

	const stepLabel = `${step + 1} / ${steps.length}`;

	return (
		<View
			accessible
			accessibilityLabel={`Completion review, step ${step + 1} of ${steps.length}`}
			style={styles.row}
		>
			<View style={styles.dots}>
				<View style={styles.line} />
				{dots.map(dot => (
					<View
						key={dot.index}
						style={[styles.dot, dot.style]}
					/>
				))}
			</View>
			<Text style={styles.label}>{stepLabel}</Text>
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
		gap: 10,
	},
	dots: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: 56,
	},
	line: {
		position: 'absolute',
		left: 4,
		right: 4,
		height: 1,
		backgroundColor: colors.light.goldenBorder,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		borderWidth: 2,
	},
	label: {
		fontFamily: 'azeret-mono-400',
		fontSize: 11,
		color: colors.dark.text,
	},
});
