import BackgroundImage from '@/src/components/BackgroundImage';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');

/**
 * Typing
 */
interface PostcardPostmarkProps {
	children?: ReactNode;
}

/**
 * Shows the postcard heading beside the cat stamp
 */
export default function PostcardPostmark({ children }: PostcardPostmarkProps) {
	return (
		<View style={styles.header}>
			<View style={styles.heading}>{children}</View>
			<BackgroundImage
				accessible={false}
				source={postmarkImage}
				resizeMode="contain"
				style={styles.postmark}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		gap: 12,
	},
	heading: {
		flex: 1,
	},
	postmark: {
		width: 115,
		flexShrink: 0,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
});
