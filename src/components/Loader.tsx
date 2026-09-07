import { StyleSheet, Text, View } from 'react-native';
import colors from '../app/colors';

/**
 * A simple fallback while application data is loading.
 */
export default function Loader() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Loading</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		backgroundColor: colors.dark.background,
		flex: 1,
		justifyContent: 'center',
	},
	text: {
		color: colors.light.text,
		fontFamily: 'lexend-400',
		fontSize: 16,
	},
});
