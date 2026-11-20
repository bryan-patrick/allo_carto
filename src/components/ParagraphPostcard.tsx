import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { solidSurfaceShadow } from '@/src/components/surfaceStyles';
import { useNavigation, type NativeStackNavigationProp } from 'expo-router';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import {
	Animated,
	Easing,
	StyleSheet,
	Text,
	View,
	type LayoutChangeEvent,
	type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import PostcardPostmark from './PostcardPostmark';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const borderedPostcardBackground = require('@/src/app/assets/images/postcard-parts/background-bordered.jpg');
const postcardPadding = 6;
const postcardBorderWidth = 1;

/**
 * Typing
 */
export interface ParagraphPostcardProps {
	index: number;
	header?: ReactNode;
	children: ReactNode;
	isInCarousel?: boolean;
	showNewBadge?: boolean;
	onContentHeightChange?: (height: number) => void;
}

interface ParagraphPostcardBackingProps {
	index?: number;
}

/**
 * Tells us the height needed for the postcard's content, padding, and border.
 */
function reportPostcardContentHeight(
	onContentHeightChange: ParagraphPostcardProps['onContentHeightChange'],
	event: LayoutChangeEvent,
) {
	const contentHeight = event.nativeEvent.layout.height;
	const frameHeight = 2 * (postcardPadding + postcardBorderWidth);
	const postcardHeight = Math.ceil(contentHeight + frameHeight);

	onContentHeightChange?.(postcardHeight);
}

/**
 * Shows the striped card behind a paragraph's postcard.
 */
export function ParagraphPostcardBacking({ index = 0 }: ParagraphPostcardBackingProps) {
	/**
	 * The decorative card
	 */
	let backPostcardTiltStyle: ViewStyle = styles.backPostcardTiltLeft;

	if (index % 2 === 1) {
		backPostcardTiltStyle = styles.backPostcardTiltRight;
	}

	return (
		<BackgroundImage
			accessible={false}
			importantForAccessibility="no-hide-descendants"
			pointerEvents="none"
			source={borderedPostcardBackground}
			resizeMode="stretch"
			imageStyle={styles.backPostcardImage}
			style={[styles.postcard, styles.backPostcard, backPostcardTiltStyle]}
		/>
	);
}

/**
 * The actual content postcard/paragraph
 */
export default function ParagraphPostcard({
	index,
	header,
	children,
	isInCarousel = false,
	showNewBadge = false,
	onContentHeightChange,
}: ParagraphPostcardProps) {
	/**
	 * Navigation and motion preference
	 */
	const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
	const reducedMotion = useReducedMotion();

	/**
	 * Turn the postcard during page transitions.
	 */
	const [postcardRotation] = useState(function createPostcardRotation() {
		let initialRotation = 10;

		if (reducedMotion || isInCarousel) {
			initialRotation = 0;
		}

		return new Animated.Value(initialRotation);
	});

	/**
	 * Front animation
	 */
	const frontPostcardStyle = {
		transform: [
			{
				perspective: 1000,
			},
			{
				rotateY: postcardRotation.interpolate({
					inputRange: [0, 10],
					outputRange: ['0deg', '10deg'],
				}),
			},
		],
	};

	/**
	 * Start the card's turn when the page moves, so it is visible during the slide.
	 */
	useLayoutEffect(() => {
		const removeTransitionListener = navigation.addListener('transitionStart', event => {
			let targetRotation = 0;
			let animationDuration = 300;

			if (event.data.closing && !reducedMotion) {
				targetRotation = 10;
			}

			if (reducedMotion) {
				animationDuration = 0;
			}

			Animated.timing(postcardRotation, {
				toValue: targetRotation,
				duration: animationDuration,
				easing: Easing.inOut(Easing.quad),
				useNativeDriver: true,
			}).start();
		});
		const removeGestureCancelListener = navigation.addListener('gestureCancel', () => {
			postcardRotation.setValue(0);
		});

		if (reducedMotion) {
			postcardRotation.setValue(0);
		}

		return () => {
			removeTransitionListener();
			removeGestureCancelListener();
			postcardRotation.stopAnimation();
		};
	}, [navigation, postcardRotation, reducedMotion]);

	return (
		<View style={[styles.stack, isInCarousel && styles.carouselStack]}>
			{!isInCarousel && <ParagraphPostcardBacking index={index} />}
			<View style={[styles.frontLayer, isInCarousel && styles.carouselFace]}>
				<Animated.View
					style={[styles.postcardFace, frontPostcardStyle, isInCarousel && styles.carouselFace]}
				>
					<BackgroundImage
						source={postcardBackground}
						style={[styles.postcard, isInCarousel && styles.carouselFace]}
					>
						<View style={[styles.border, isInCarousel && styles.carouselFace]}>
							{/* Measure the content before the frame stretches to match the other postcards. */}
							<View onLayout={event => reportPostcardContentHeight(onContentHeightChange, event)}>
								{Boolean(header) && <PostcardPostmark>{header}</PostcardPostmark>}
								{children}
							</View>
						</View>
					</BackgroundImage>
					{showNewBadge && (
						<View
							pointerEvents="none"
							style={styles.newBadge}
						>
							<Text
								numberOfLines={1}
								style={styles.newBadgeText}
							>
								New!
							</Text>
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
	stack: {
		margin: 12,
		position: 'relative',
	},
	carouselStack: {
		margin: 0,
		flexGrow: 1,
	},
	carouselFace: {
		flexGrow: 1,
	},
	/**
	 * Keeps the turning postcard in front of the striped card beneath it.
	 */
	frontLayer: {
		zIndex: 1,
		elevation: 1,
	},
	postcardFace: {
		position: 'relative',
	},
	postcard: {
		...solidSurfaceShadow,
		padding: postcardPadding,
		backgroundColor: colors.dark.background,
		borderColor: colors.dark.border,
		borderWidth: postcardBorderWidth,
		borderRadius: 12,
		overflow: 'hidden',
	},
	backPostcard: {
		...solidSurfaceShadow,
		zIndex: 0,
		padding: 0,
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		width: '100%',
	},
	backPostcardImage: {
		borderRadius: 10,
	},
	backPostcardTiltLeft: {
		transform: [
			{
				rotate: '-4deg',
			},
		],
	},
	backPostcardTiltRight: {
		transform: [
			{
				rotate: '4deg',
			},
		],
	},
	border: {
		borderWidth: 0,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
	},
	newBadge: {
		...solidSurfaceShadow,
		position: 'absolute',
		top: -4,
		right: -4,
		zIndex: 2,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.dark.primary,
		borderRadius: 4,
		paddingHorizontal: 10,
		paddingVertical: 5,
		transform: [
			{
				rotate: '10deg',
			},
		],
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 15,
	},
});
