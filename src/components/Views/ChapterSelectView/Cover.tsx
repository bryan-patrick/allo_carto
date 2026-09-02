import colors from '@/src/app/colors';
import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

/**
 * Typing
 */
interface CoverProps {
	children: ReactNode;
}

/**
 * The "cover" of the book. This includes the image of the chapter.
 */
export default function Cover({ children }: CoverProps) {
	/**
	 * Render the component
	 */
	return (
		<ImageBackground
			resizeMode="stretch"
			source={require('../../../app/assets/images/book-parts/cover.jpg')}
			style={styles.cover}
		>
			<View style={styles.coverInner}>{children}</View>
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	cover: {
		flexGrow: 1,
		flexShrink: 1,
		padding: 8,
		paddingLeft: 0,
	},
	coverInner: {
		borderWidth: 2,
		borderBottomRightRadius: 8,
		borderTopRightRadius: 8,
		borderLeftWidth: 0,
		borderColor: colors.utility.cardBorder,
	},
});
