import { useLinkProps } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { LinkProps } from 'expo-router';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../app/styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Audio Import
 */
const tapAudio = require('@/src/app/assets/sounds/tap.wav');

/**
 * Typing
 */
interface LinkButtonProps extends PressableProps {
  SVGElement?: ReactElement;
  handler?: Function;
  children?: ReactNode;
  action?: Readonly<any>;
  params?: LinkProps;
  screen?: string;
  href?: string;
  props?: any
}

/**
 * LinkButton Component
 * A link that looks like a button
 */
export default function LinkButton({
  handler = () => { },
  action,
  screen,
  params,
  href,
  children,
  SVGElement,
  style,
  props,
}: LinkButtonProps) {
  /**
   * Sound effect
   */
  const tapPlayer = useAudioPlayer(tapAudio);
  tapPlayer.volume = 0.2;

  /**
   * Destructure styles
   */
  const {
    linkButton,
    linkText,
    hoveredLinkButton,
    hoveredLinkText,
    pressedLinkText
  } = styles;
  let currentLinkButtonStyles = linkButton;
  let currentLinkTextStyles = linkText;

  /**
   * State/prop vars
   */
  const linkProps = useLinkProps({
    screen: screen ?? '',
    params: params ?? {},
    action,
    href
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const shadowOffsetHeight = useSharedValue(8);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    top: top.value,
    borderRadius: 8
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowOffset: {
      width: 0,
      height: shadowOffsetHeight.value
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
      shadowOffsetHeight.value = 8;
    }

  }, [isPressed, shadowOffsetHeight, top])

  /**
   * Action handlers
   */
  function handlePressIn() {
    setIsPressed(true);
    tapPlayer.seekTo(0);
    tapPlayer.play();
  }

  function handlePressOut() {
    setIsPressed(false);
    handler();
  }

  /**
   * Pressed styles before hovered styles
   */
  if (isPressed) {
    currentLinkTextStyles = { ...linkText, ...pressedLinkText };
  } else if (isHovered) {
    currentLinkButtonStyles = { ...linkButton, ...hoveredLinkButton };
    currentLinkTextStyles = { ...linkText, ...hoveredLinkText };
  }

  /**
   * Pull in props when used as a link button
   */
  let allTheProps = props;

  if (screen) {
    allTheProps = { ...props, ...linkProps };
  }

  /**
   * Render the thing
   */
  return (
    <Animated.View style={[style as ViewStyle, animatedContainerStyle]}>
      <AnimatedPressable
        {...allTheProps}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[currentLinkButtonStyles, animatedShadowStyle]}
      >
        {SVGElement}
        <Text style={currentLinkTextStyles}>{children}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

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
    padding: 14,
    gap: 16,
    shadowColor: colors.dark.border,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  linkText: {
    color: colors.light.text,
    fontWeight: 800,
    fontSize: 16,
  },
  hoveredLinkButton: {
    borderRadius: 4,
    borderWidth: 2,
  },
  hoveredLinkText: {
    color: colors.light.text,
  },
  pressedLinkText: {
    color: colors.light.primary,
  }
})  