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

const styles = StyleSheet.create({
	pagesContainer: {
		position: 'relative',
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		marginBottom: 8,
	},
	pages: {
		width: '100%',
		height: 12,
		zIndex: -1,
	},
});
