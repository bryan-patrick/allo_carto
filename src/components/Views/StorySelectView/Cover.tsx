import BackgroundImage from '@/src/components/BackgroundImage';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { bookStyles } from './bookStyles';

/*
 * Typing
 */
interface CoverProps {
	children: ReactNode;
}

// Show the story on a rounded cover with a border along its top, right, and bottom edges.
export default function Cover({ children }: CoverProps) {
	return (
		<BackgroundImage
			resizeMode="stretch"
			source={require('../../../app/assets/images/book-parts/cover.jpg')}
			style={[styles.cover, bookStyles.coverCorners]}
			imageStyle={bookStyles.coverCorners}
		>
			{children}
			{/* Draw the border above the cover image so it stays visible at the corners. */}
			<View
				accessible={false}
				pointerEvents="none"
				style={bookStyles.coverBorder}
			/>
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
	},
});
