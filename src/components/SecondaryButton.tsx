import {
	cloneElement,
	isValidElement,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import {
	GestureResponderEvent,
	Pressable,
	PressableProps,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const secondaryButtonShadowHeight = 2;

interface SecondaryButtonProps extends Omit<
	PressableProps,
	'children' | 'style'
> {
	SVGElement?: ReactNode;
	children?: ReactNode;
	color?: string;
	fullwidth?: boolean;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	type?: 'fill' | 'outline';
}

/**
 * SecondaryButton Component
 */
export default function SecondaryButton({
	SVGElement,
	children,
	color,
	fullwidth = false,
	style,
	textStyle,
	onPressIn,
	onPressOut,
	type = 'fill',
	...props
}: SecondaryButtonProps) {
	/**
	 * Destructure styles
	 */
	const { buttonStyle, buttonTextRowStyle, buttonTextStyle, fullwidthStyle } =
		styles;

	/**
	 * State vars
	 */
	const [isPressed, setIsPressed] = useState(false);

	const typeStyle =
		type === 'outline' ?
			{
				backgroundColor: 'transparent',
				...(color ? { borderColor: color } : {}),
			}
		: color ? { backgroundColor: color }
		: {};

	const outlineTextStyle = type === 'outline' && color ? { color } : {};
	const iconElement =
		(
			type === 'outline' &&
			color &&
			isValidElement<{ color?: string }>(SVGElement)
		) ?
			cloneElement(SVGElement, { color })
		:	SVGElement;

	/**
	 * Animation vars
	 */
	const top = useSharedValue(0);
	const shadowOffsetHeight = useSharedValue(secondaryButtonShadowHeight);

	const animatedButtonStyle = useAnimatedStyle(() => ({
		top: top.get(),
		shadowOffset: {
			width: 0,
			height: shadowOffsetHeight.get(),
		},
	}));

	/**
	 * Handle animations on pressed
	 */
	useEffect(() => {
		if (isPressed) {
			top.set(
				withTiming(2, {
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
			shadowOffsetHeight.set(secondaryButtonShadowHeight);
		}
	}, [isPressed, shadowOffsetHeight, top]);

	/**
	 * Handlers
	 */
	function handleOnPressIn(event: GestureResponderEvent) {
		setIsPressed(true);
		onPressIn?.(event);
	}

	function handleOnPressOut(event: GestureResponderEvent) {
		setIsPressed(false);
		onPressOut?.(event);
	}

	return (
		<AnimatedPressable
			{...props}
			style={[
				buttonStyle,
				animatedButtonStyle,
				fullwidth && fullwidthStyle,
				typeStyle,
				style,
			]}
			onPressIn={handleOnPressIn}
			onPressOut={handleOnPressOut}
			hitSlop={4}
		>
			<View style={buttonTextRowStyle}>
				<Text style={[buttonTextStyle, textStyle, outlineTextStyle]}>
					{children}
				</Text>
				{iconElement}
			</View>
		</AnimatedPressable>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	fullwidthStyle: {
		width: '100%',
	},
	buttonStyle: {
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.dark.border,
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 12,
		shadowOpacity: 1,
		shadowRadius: 0,
		borderWidth: 1,
		shadowOffset: { width: 0, height: secondaryButtonShadowHeight },
		backgroundColor: colors.light.background,
		shadowColor: colors.dark.border,
		marginBottom: secondaryButtonShadowHeight,
		color: colors.dark.primary,
		gap: 8,
	},
	buttonTextRowStyle: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4,
		fontSize: 12,
	},
	buttonTextStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
	},
});
