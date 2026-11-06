import BackgroundImage from '@/src/components/BackgroundImage';
import type { ReactNode } from 'react';
import {
	Animated,
	Image,
	StyleSheet,
	View,
	type ImageSourcePropType,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import colors from '../app/colors';

// TODO really the postcard BG gives it a cleaner look
//const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

const postcardBackground = require('@/src/app/assets/images/chapter-images/polaroid-bg.jpg');
const stripedPostcardBackground = require('@/src/app/assets/images/postcard-parts/background-bordered.jpg');

interface ChapterPolaroidProps {
	source: ImageSourcePropType;
	photoAspectRatio?: number;
	photoNoiseSource?: ImageSourcePropType;
	photoNoiseOpacity?: number;
	footer?: ReactNode;
	badge?: ReactNode;
	style?: StyleProp<ViewStyle>;
	frontStyle?: StyleProp<Animated.WithAnimatedValue<ViewStyle>>;
}

/*
 * Show a chapter photo in a Polaroid frame, with a tilted frame behind it.
 */
export default function ChapterPolaroid({
	source,
	photoAspectRatio = 1.5,
	photoNoiseSource,
	photoNoiseOpacity = 0.2,
	footer,
	badge,
	style,
	frontStyle,
}: ChapterPolaroidProps) {
	const photoStyle = {
		aspectRatio: photoAspectRatio,
	};
	const noiseStyle = {
		opacity: photoNoiseOpacity,
	};

	return (
		<View style={[styles.stack, style]}>
			<BackgroundImage
				accessible={false}
				pointerEvents="none"
				source={stripedPostcardBackground}
				imageStyle={styles.roundedCorners}
				resizeMode="stretch"
				style={[styles.frame, styles.roundedCorners, styles.backPolaroid]}
			/>
			<View style={styles.frontLayer}>
				<Animated.View style={[styles.frame, styles.roundedCorners, frontStyle]}>
					<BackgroundImage
						accessible={false}
						source={postcardBackground}
						imageStyle={styles.roundedCorners}
						resizeMode="stretch"
						style={[styles.paper, styles.roundedCorners, Boolean(footer) && styles.paperWithFooter]}
					>
						<View
							pointerEvents="none"
							style={[styles.paperOverlay, styles.roundedCorners]}
						/>
						<View style={[styles.photo, photoStyle]}>
							<Image
								accessible={false}
								source={source}
								resizeMode="cover"
								style={styles.photoLayer}
							/>
							{photoNoiseSource && (
								<Image
									accessible={false}
									pointerEvents="none"
									source={photoNoiseSource}
									resizeMode="repeat"
									style={[styles.photoLayer, noiseStyle]}
								/>
							)}
						</View>
						{Boolean(footer) && <View style={styles.footer}>{footer}</View>}
					</BackgroundImage>
					{Boolean(badge) && (
						<View
							pointerEvents="none"
							style={styles.cornerBadge}
						>
							{badge}
						</View>
					)}
				</Animated.View>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	roundedCorners: {
		borderRadius: 6,
	},
	stack: {
		width: '100%',
		position: 'relative',
	},

	// Keep the turning photo in front of the striped card beneath it.
	frontLayer: {
		zIndex: 1,
		elevation: 5,
	},
	frame: {
		width: '100%',
		backgroundColor: '#eee9df',
		borderWidth: 1,
		borderColor: colors.light.border,
		elevation: 2,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowRadius: 1,
		shadowOpacity: 0.4,
	},
	backPolaroid: {
		zIndex: 0,
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		transform: [
			{
				rotate: '-4deg',
			},
		],
		elevation: 2,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowRadius: 1,
		shadowOpacity: 0.4,
	},
	cornerBadge: {
		position: 'absolute',
		top: -6,
		right: -8,
		zIndex: 1,
		transform: [
			{
				rotate: '12deg',
			},
		],
	},
	paper: {
		backgroundColor: '#eee9df',
		borderColor: colors.dark.border,
		padding: 8,
		paddingBottom: 28,
		elevation: 2,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowRadius: 1,
		shadowOpacity: 0.4,
	},
	paperWithFooter: {
		paddingBottom: 0,
	},
	paperOverlay: {
		...StyleSheet.absoluteFill,
		backgroundColor: 'rgba(255, 250, 250, 0.75)',
	},
	footer: {
		minHeight: 28,
		justifyContent: 'center',
		paddingVertical: 4,
	},
	photo: {
		width: '100%',
	},
	photoLayer: {
		...StyleSheet.absoluteFill,
		width: '100%',
		height: '100%',
	},
});
