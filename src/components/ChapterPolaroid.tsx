import BackgroundImage from '@/src/components/BackgroundImage';
import type { ReactNode } from 'react';
import {
	Image,
	StyleSheet,
	View,
	type ImageSourcePropType,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import colors from '../app/colors';

// TODO really the postcard BG gives it a cleaner look
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

//const polaroidBackground = require('@/src/app/assets/images/chapter-images/polaroid-bg.jpg');

interface ChapterPolaroidProps {
	source: ImageSourcePropType;
	photoAspectRatio?: number;
	photoNoiseSource?: ImageSourcePropType;
	photoNoiseOpacity?: number;
	footer?: ReactNode;
	badge?: ReactNode;
	style?: StyleProp<ViewStyle>;
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
				source={postcardBackground}
				resizeMode="stretch"
				style={[styles.frame, styles.backPolaroid]}
			>
				<View style={styles.paperOverlay} />
			</BackgroundImage>
			<View style={styles.frame}>
				<BackgroundImage
					accessible={false}
					source={postcardBackground}
					resizeMode="stretch"
					style={[styles.paper, Boolean(footer) && styles.paperWithFooter]}
				>
					<View
						pointerEvents="none"
						style={styles.paperOverlay}
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
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	stack: {
		width: '100%',
		position: 'relative',
	},

	frame: {
		width: '100%',
		backgroundColor: '#eee9df',
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
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		borderColor: colors.dark.border,
		transform: [
			{
				rotate: '-4deg',
			},
		],
		elevation: 4,
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
		backgroundColor: 'rgba(255, 254, 250, 0.9)',
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
