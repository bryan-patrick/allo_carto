import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/*
 * Typing
 */
interface CoverProps {
	children: ReactNode;
}

/*
 * The "cover" of the book. This includes the story details.
 */
export default function Cover({ children }: CoverProps) {
	/*
	 * Render the component
	 */
	return (
		<BackgroundImage
			resizeMode="stretch"
			source={require('../../../app/assets/images/book-parts/cover.jpg')}
			style={styles.cover}
		>
			<View style={styles.coverInner}>{children}</View>
		</BackgroundImage>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	cover: {
		flexGrow: 1,
		flexShrink: 1,
		padding: 8,
		paddingLeft: 0,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		overflow: 'hidden',
	},
	coverInner: {
		flexGrow: 1,
		borderWidth: 2,
		borderBottomRightRadius: 8,
		borderTopRightRadius: 0,
		borderLeftWidth: 0,
		borderColor: colors.utility.cardBorder,
	},
});
