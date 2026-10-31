import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { StyleSheet, View } from 'react-native';

/*
 * The graphical Crease (of the book)
 */
export default function Crease() {
	/*
	 * Render the component
	 */
	return (
		<BackgroundImage
			resizeMode="stretch"
			source={require('../../../app/assets/images/book-parts/crease.jpg')}
			style={styles.crease}
		>
			<View style={styles.innerBorder} />
		</BackgroundImage>
	);
}

/*
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
		borderColor: colors.utility.cardBorder,
		flexGrow: 1,
	},
});
