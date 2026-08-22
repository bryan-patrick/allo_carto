import { ImageBackground, StyleSheet, View } from 'react-native';

/**
 * The graphical Crease (of the book)
 */
export default function Crease() {
	/**
	 * Destructure styles
	 */
	const { creaseStyle, innerBorder } = styles;

	/**
	 * Render the component
	 */
	return (
		<ImageBackground
			resizeMode="stretch"
			source={require('../../../app/assets/images/book-parts/crease.jpg')}
			style={creaseStyle}
		>
			<View style={innerBorder} />
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	creaseStyle: {
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
