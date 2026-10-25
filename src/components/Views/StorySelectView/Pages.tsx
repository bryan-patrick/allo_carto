import { ImageBackground, StyleSheet, View } from 'react-native';

const pagesImg = require('@/src/app/assets/images/book-parts/pages.png');

export default function Pages() {
	return (
		<View style={styles.pagesContainer}>
			<ImageBackground
				source={pagesImg}
				resizeMode="stretch"
				style={styles.pages}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	pagesContainer: {
		position: 'relative',
		marginBottom: 0,
	},
	pages: {
		width: '100%',
		height: 12,
		zIndex: -1,
	},
});
