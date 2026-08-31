import { ImageBackground, StyleSheet, View } from 'react-native';

/**
 * The graphical Crease (of the book)
 */
export default function Crease() {
	/**
	 * Render the component
	 */
	return (
		<ImageBackground
			resizeMode="stretch"
			source={require('../../../app/assets/images/book-parts/crease.jpg')}
			style={styles.crease}
		>
			<View style={styles.innerBorder} />
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	crease: {
		width: 8,
		paddingTop: 8,
		paddingBottom: 8,
		display: 'flex',
	},
	innerBorder: {
		borderTopWidth: 2,
		borderBottomWidth: 2,
		borderColor: 'rgba(0, 0, 0, 0.4)',
		flexGrow: 1,
	},
});
