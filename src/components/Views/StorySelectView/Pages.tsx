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
			<ImageBackground
				source={pagesImg}
				resizeMode="stretch"
				style={styles.pagesOffset}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	pagesContainer: {
		position: 'relative',
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
		marginBottom: 8,
	},
	pages: {
		width: '100%',
		height: 16,
		zIndex: -1,
	},
	pagesOffset: {
		position: 'absolute',
		width: '100%',
		height: 16,
		top: -5,
		zIndex: -2,
	},
});
