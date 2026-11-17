import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { useNavigation, type NativeStackNavigationProp } from 'expo-router';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import PostcardPostmark from './PostcardPostmark';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const borderedPostcardBackground = require('@/src/app/assets/images/postcard-parts/background-bordered.jpg');

/**
 * Typing
 */
interface ParagraphPostcardProps {
	index: number;
	header?: ReactNode;
	children: ReactNode;
}

/**
 * Shows a paragraph on a postcard
 */
export default function ParagraphPostcard({ index, header, children }: ParagraphPostcardProps) {
	/**
	 * Navigation and motion preference
	 */
	const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
	const reducedMotion = useReducedMotion();

	/**
	 * We rotate the postcard a little on page transition
	 */
	const [postcardRotation] = useState(function createPostcardRotation() {
		let initialRotation = 10;

		if (reducedMotion) {
			initialRotation = 0;
		}

		return new Animated.Value(initialRotation);
	});

	/**
	 * Front animation and decorative card angle
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
	let backPostcardTiltStyle: ViewStyle = styles.backPostcardTiltLeft;

	if (index % 2 === 1) {
		backPostcardTiltStyle = styles.backPostcardTiltRight;
	}

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
		<View style={styles.stack}>
			<BackgroundImage
				accessible={false}
				pointerEvents="none"
				source={borderedPostcardBackground}
				resizeMode="stretch"
				style={[styles.postcard, styles.backPostcard, backPostcardTiltStyle]}
			/>
			<View style={styles.frontLayer}>
				<Animated.View style={frontPostcardStyle}>
					<BackgroundImage
						source={postcardBackground}
						style={styles.postcard}
					>
						<View style={styles.border}>
							{Boolean(header) && <PostcardPostmark>{header}</PostcardPostmark>}
							{children}
						</View>
					</BackgroundImage>
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
	/**
	 * Keeps the turning postcard in front of the striped card beneath it.
	 */
	frontLayer: {
		zIndex: 1,
		elevation: 1,
	},
	postcard: {
		padding: 6,
		backgroundColor: colors.dark.background,
		borderWidth: 2,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
	},
	backPostcard: {
		zIndex: 0,
		padding: 0,
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		width: '100%',
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
});
