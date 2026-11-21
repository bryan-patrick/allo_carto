import BackgroundImage from '@/src/components/BackgroundImage';
import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');
const stampFrame = require('@/src/app/assets/images/collections/stamp-frame_200x230.png');

/**
 * Keep the original postmark size and leave paper around the printed stamp.
 */
const postmarkWidth = 115;
const postmarkHeight = postmarkWidth * (5 / 12);
const stampWidth = postmarkWidth * 0.35;
const stampHeight = stampWidth * (230 / 200);
const stampPadding = stampWidth * 0.1;
const stampArtworkWidth = stampWidth - stampPadding * 2;
const stampArtworkScale = stampArtworkWidth / 360;

/**
 * Typing
 */
interface PostcardPostmarkProps {
	children?: ReactNode;
}

/**
 * Shows the postcard heading beside the postmark and framed cat stamp.
 */
export default function PostcardPostmark({ children }: PostcardPostmarkProps) {
	return (
		<View style={styles.header}>
			<View style={styles.heading}>{children}</View>
			<View
				accessible={false}
				importantForAccessibility="no-hide-descendants"
				style={styles.postmark}
			>
				<View style={styles.cancellation}>
					<Image
						source={postmarkImage}
						style={styles.cancellationImage}
					/>
				</View>
				<BackgroundImage
					source={stampFrame}
					resizeMode="contain"
					imageStyle={styles.stampFrame}
					style={styles.stamp}
				>
					<View style={styles.stampArtwork}>
						<Image
							source={postmarkImage}
							style={styles.stampArtworkImage}
						/>
					</View>
				</BackgroundImage>
			</View>
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
		width: postmarkWidth,
		height: postmarkHeight,
		flexShrink: 0,
		opacity: 0.6,
	},
	cancellation: {
		width: postmarkWidth - stampWidth,
		height: postmarkHeight,
		overflow: 'hidden',
	},
	cancellationImage: {
		width: postmarkWidth,
		height: postmarkHeight,
	},
	stamp: {
		position: 'absolute',
		right: 0,
		top: (postmarkHeight - stampHeight) / 2,
		width: stampWidth,
		height: stampHeight,
		padding: stampPadding,
	},
	stampFrame: {
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.65,
		shadowRadius: 1,
	},
	stampArtwork: {
		flex: 1,
		overflow: 'hidden',
	},
	/**
	 * Show only the printed rectangle from the existing cat stamp image.
	 */
	stampArtworkImage: {
		position: 'absolute',
		width: 1200 * stampArtworkScale,
		height: 500 * stampArtworkScale,
		left: -810 * stampArtworkScale,
		top: -38 * stampArtworkScale,
	},
});
