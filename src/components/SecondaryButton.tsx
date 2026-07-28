import { ReactNode, useEffect, useState } from 'react';
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
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from '../app/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SecondaryButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  SVGElement?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  type?: 'primary' | 'secondary';
}

/**
 * SecondaryButton Component
 */
export default function SecondaryButton({
  SVGElement,
  children,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  ...props
}: SecondaryButtonProps) {
  /**
   * Destructure styles
   */
  const {
    buttonStyle,
    buttonTextRowStyle,
    buttonTextStyle,
  } = styles;

  /**
   * State vars
   */
  const [ isPressed, setIsPressed ] = useState(false);

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const shadowOffsetHeight = useSharedValue(4);

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
      top.set(withTiming(4, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      }));

      shadowOffsetHeight.set(withTiming(0, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      }));
    } else {
      top.set(0);
      shadowOffsetHeight.set(4);
    }

  }, [ isPressed, shadowOffsetHeight, top ]);

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
        style,
      ]}
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
      hitSlop={4}
    >
      <View style={buttonTextRowStyle}>
        <Text style={[
          buttonTextStyle,
          textStyle,
        ]}>
          {children}
        </Text>
        {SVGElement}
      </View>
    </AnimatedPressable>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: colors.light.background,
    shadowColor: colors.dark.border,
    marginBottom: 4, // Match shadow offset height
    color: colors.dark.primary,
    gap: 8,
  },
  buttonTextRowStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    fontSize: 12
  },
  buttonTextStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    fontSize: 16,
  },
});
