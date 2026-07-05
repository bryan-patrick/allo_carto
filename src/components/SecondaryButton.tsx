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
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const shadowOffsetHeight = useSharedValue(8);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    top: top.value,
    borderRadius: 8,
    shadowOffset: {
      width: 0,
      height: shadowOffsetHeight.value,
    },
  }));

  /**
   * Handle animations on pressed
   */
  useEffect(() => {
    if (isPressed) {
      top.value = withTiming(6, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      });

      shadowOffsetHeight.value = withTiming(0, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      top.value = 0;
      shadowOffsetHeight.value = 6;
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
        style,
      ]}
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
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
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  buttonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.primary,
    borderRadius: 6,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    shadowColor: colors.dark.border,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 6, // Match shadow offset height
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  buttonTextRowStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  buttonTextStyle: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    fontSize: 16,
  },
});
