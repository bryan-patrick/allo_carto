import { useAudioPlayer } from 'expo-audio';
import { useLinkProps } from 'expo-router/react-navigation';
import { cloneElement, isValidElement, ReactElement, ReactNode, useEffect, useState } from 'react';
import {
	Pressable,
	PressableProps,
	StyleProp,
	StyleSheet,
	Text,
	View,
	ViewStyle,
} from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import colors from '../app/colors';
import SVGRightArrow from './SVG/SVGRightArrow';

/**
 * Creats the JSX <AnimatedPressable> we need to animate the component
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const linkButtonShadowHeight = 2;

/**
 * Audio Import
 */
const tapAudio = require('@/src/app/assets/sounds/tap.wav');

/**
 * Typing
 */
interface LinkButtonProps extends Omit<PressableProps, 'style'> {
	SVGElement?: ReactElement;
	handler?: () => Promise<void> | void;
	children?: ReactNode;
	params?: Record<string, string | string[] | undefined>;
	screen?: string;
	href?: string;
	props?: any;
	arrowSize?: number;
	useArrow?: boolean;
	arrowColor?: string;
	color?: string;
	contentPaddingHorizontal?: number;
	contentPaddingVertical?: number;
	fullwidth?: boolean;
	showInnerBorder?: boolean;
	showShadow?: boolean;
	style?: StyleProp<ViewStyle>;
	type?: 'fill' | 'outline';
}

/**
 * LinkButton Component
 * A link that looks like a button
 */
export default function LinkButton({
	handler = () => {},
	screen,
	params,
	href,
	children,
	SVGElement,
	style,
	props,
	useArrow = true,
	arrowSize = 18,
	disabled = false,
	arrowColor = colors.light.text,
	color,
	contentPaddingHorizontal = 16,
	contentPaddingVertical = 8,
	fullwidth = false,
	showInnerBorder = true,
	showShadow = true,
	type = 'fill',
	...pressableProps
}: LinkButtonProps) {
	const tapPlayer = useAudioPlayer(tapAudio);
	const linkProps = useLinkProps({
		screen: screen ?? '',
		params: params ?? {},
		href,
	});
	const [isPressed, setIsPressed] = useState(false);
	const buttonShadowHeight = showShadow ? linkButtonShadowHeight : 0;
	const top = useSharedValue(0);
	const shadowOffsetHeight = useSharedValue(buttonShadowHeight);
	const animatedButtonStyle = useAnimatedStyle(() => ({
		top: top.get(),
		shadowOffset: {
			width: 0,
			height: shadowOffsetHeight.get(),
		},
	}));

	let allTheProps = { ...pressableProps, ...props };
	let typeStyle: ViewStyle = {};
	let outlineTextStyle = {};
	let iconElement = SVGElement;
	let resolvedArrowColor = arrowColor;

	if (type === 'outline') {
		typeStyle = { backgroundColor: 'transparent' };

		if (color) {
			typeStyle = {
				backgroundColor: 'transparent',
				borderColor: color,
			};
			outlineTextStyle = { color };
			resolvedArrowColor = color;

			if (isValidElement<{ color?: string }>(SVGElement)) {
				iconElement = cloneElement(SVGElement, { color });
			}
		}
	} else if (color) {
		typeStyle = { backgroundColor: color };
	}

	/**
	 * Pull in props when used for a navigation link.
	 */
	if (screen) {
		allTheProps = { ...pressableProps, ...props, ...linkProps };
	}

	const {
		onPress: buttonPress,
		onPressIn: buttonPressIn,
		onPressOut: buttonPressOut,
		...buttonProps
	} = allTheProps;

	/**
	 * Sound effect
	 */
	useEffect(() => {
		// eslint-disable-next-line react-hooks/immutability
		tapPlayer.volume = 0.2;
	}, [tapPlayer]);

	/**
	 * Handle animations on pressed
	 */
	useEffect(() => {
		if (isPressed) {
			top.set(
				withTiming(buttonShadowHeight, {
					duration: 100,
					easing: Easing.inOut(Easing.ease),
				}),
			);

			shadowOffsetHeight.set(
				withTiming(0, {
					duration: 100,
					easing: Easing.inOut(Easing.ease),
				}),
			);
		} else {
			top.set(0);
			shadowOffsetHeight.set(buttonShadowHeight);
		}
	}, [buttonShadowHeight, isPressed, shadowOffsetHeight, top]);

	/**
	 * Action handlers
	 */
	async function playTapSound() {
		try {
			await tapPlayer.seekTo(0);
			tapPlayer.play();
		} catch {
			console.log('There was an error while playing the LinkButton tap sound.');
		}
	}

	/**
	 * Render the thing
	 */
	return (
		<AnimatedPressable
			{...buttonProps}
			onPress={event => {
				handler();
				buttonPress?.(event);
			}}
			onPressIn={event => {
				setIsPressed(true);
				playTapSound();
				buttonPressIn?.(event);
			}}
			onPressOut={event => {
				setIsPressed(false);
				buttonPressOut?.(event);
			}}
			style={[
				styles.linkButton,
				animatedButtonStyle,
				fullwidth && styles.fullwidth,
				typeStyle,
				!showShadow && styles.withoutShadow,
				style,
			]}
			disabled={disabled}
		>
			<View
				style={[
					styles.innerRow,
					!showInnerBorder && styles.innerRowWithoutBorder,
					{
						paddingHorizontal: contentPaddingHorizontal,
						paddingVertical: contentPaddingVertical,
					},
				]}
			>
				{iconElement}
				<Text style={[styles.linkText, outlineTextStyle]}>{children}</Text>
				{useArrow && (
					<SVGRightArrow
						height={String(arrowSize)}
						width={String(arrowSize)}
						color={resolvedArrowColor}
					/>
				)}
			</View>
		</AnimatedPressable>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	linkButton: {
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.dark.border,
		backgroundColor: colors.dark.primary,
		borderRadius: 8,
		borderWidth: 2,
		shadowColor: colors.dark.border,
		shadowOffset: { width: 0, height: linkButtonShadowHeight },
		marginBottom: linkButtonShadowHeight,
		shadowOpacity: 1,
		shadowRadius: 0,
		gap: 8,
	},
	fullwidth: {
		width: '100%',
	},
	withoutShadow: {
		shadowColor: 'transparent',
		shadowOpacity: 0,
	},
	innerRow: {
		width: '100%',
		padding: 2,
		borderColor: 'rgba(255, 255, 255, 0.1)',
		borderWidth: 2,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 4,
	},
	innerRowWithoutBorder: {
		borderColor: 'transparent',
		borderWidth: 0,
	},
	linkText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
});
