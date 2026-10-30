import type { ReactNode } from 'react';
import {
	Image,
	ImageBackground,
	StyleSheet,
	View,
	type ImageSourcePropType,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import colors from '../app/colors';

const polaroidBackground = require('@/src/app/assets/images/chapter-images/polaroid-bg.jpg');

interface ChapterPolaroidProps {
	source: ImageSourcePropType;
	photoAspectRatio?: number;
	photoNoiseSource?: ImageSourcePropType;
	photoNoiseOpacity?: number;
	footer?: ReactNode;
	badge?: ReactNode;
	style?: StyleProp<ViewStyle>;
}

/**
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
			<Image
				accessible={false}
				pointerEvents="none"
				source={polaroidBackground}
				resizeMode="stretch"
				style={[styles.frame, styles.backPolaroid]}
			/>
			<View style={styles.frame}>
				<ImageBackground
					accessible={false}
					source={polaroidBackground}
					resizeMode="stretch"
					style={[styles.paper, Boolean(footer) && styles.paperWithFooter]}
				>
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
				</ImageBackground>
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
		borderRadius: 2,
		elevation: 4,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowRadius: 4,
		shadowOpacity: 0.6,
	},
	backPolaroid: {
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		borderWidth: 1,
		borderColor: colors.dark.border,
		overflow: 'hidden',
		transform: [
			{
				rotate: '-4deg',
			},
		],
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
		borderWidth: 1,
		borderColor: colors.dark.border,
		padding: 10,
		paddingBottom: 28,
		borderRadius: 2,
		overflow: 'hidden',
	},
	paperWithFooter: {
		paddingBottom: 0,
	},
	footer: {
		minHeight: 28,
		justifyContent: 'center',
		paddingVertical: 6,
	},
	photo: {
		width: '100%',
		overflow: 'hidden',
	},
	photoLayer: {
		...StyleSheet.absoluteFill,
		width: '100%',
		height: '100%',
	},
});
