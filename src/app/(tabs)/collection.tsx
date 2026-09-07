import MaterialSymbol from '@/src/components/MaterialSymbol';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../colors';

export default function Collections() {
	return (
		<View style={styles.container}>
			<MaterialSymbol
				name="collections_bookmark"
				size={40}
				color={colors.light.goldenBorder}
			/>
			<Text style={styles.title}>Collections</Text>
			<Text style={styles.message}>Coming soon.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		backgroundColor: colors.dark.background,
		flex: 1,
		gap: 8,
		justifyContent: 'center',
		padding: 24,
	},
	title: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 20,
	},
	message: {
		color: colors.light.goldenBorder,
		fontFamily: 'lexend-400',
		fontSize: 16,
	},
});
