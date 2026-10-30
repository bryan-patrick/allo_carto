import MaterialSymbol from '@/src/components/MaterialSymbol';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../colors';

/*
 * Shows the Achievements placeholder until the feature is ready.
 */
export default function Achievements() {
	return (
		<View style={styles.container}>
			<MaterialSymbol
				name="emoji_events"
				size={40}
				color={colors.light.goldenBorder}
			/>
			<Text style={styles.title}>Achievements</Text>
			<Text style={styles.message}>Coming soon.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 24,
		backgroundColor: colors.dark.background,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		color: colors.light.text,
	},
	message: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		color: colors.light.goldenBorder,
	},
});
