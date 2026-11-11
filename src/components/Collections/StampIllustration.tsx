import { placeholderStampImage } from '@/data/french/collectionAtlas';
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
	},
	artwork: {
		width: '80%',
		height: '80%',
		borderRadius: 1,
		backgroundColor: '#ffffff',
	},
});
