import { placeholderStampImage } from '@/data/french/collectionAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';

const stampFrame = require('@/src/app/assets/images/collections/stamp-frame_200x230.png');

interface StampIllustrationProps {
	image?: ImageSourcePropType;
}

// Fit a word's artwork inside the stamp frame while keeping the frame's original shape.
export default function StampIllustration({ image }: StampIllustrationProps) {
	return (
		<BackgroundImage
			accessible={false}
			source={stampFrame}
			resizeMode="contain"
			style={styles.frame}
		>
			<Image
				accessible={false}
				source={image ?? placeholderStampImage}
				resizeMode="contain"
				style={styles.artwork}
			/>
		</BackgroundImage>
	);
}

const styles = StyleSheet.create({
	frame: {
		width: '100%',
		aspectRatio: 200 / 230,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: colors.dark.border,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.8,
		shadowRadius: 1,
	},
	artwork: {
		width: '80%',
		height: '80%',
		borderRadius: 1,
	},
});
