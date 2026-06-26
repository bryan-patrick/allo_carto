/**
 * Kind of becoming an everything bagel >.<
 */
import { useLinkProps } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from '../app/colors';
import { DeckColors } from './CardDeck/cardDeckTypes';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Audio Import
 */
const tapAudio = require('@/src/app/assets/sounds/tap.wav');

/**
 * Typing
 */
interface LinkButtonProps extends Omit<PressableProps, 'style'> {
  SVGElement?: ReactElement;
  handler?: Function;
  children?: ReactNode;
  params?: Record<string, string | string[] | undefined>;
  screen?: string;
  href?: string;
  props?: any
  deckColors?: DeckColors;
  style?: StyleProp<ViewStyle>;
}

/**
 * LinkButton Component
 * A link that looks like a button
 */
export default function LinkButton({
  handler = () => { },
  screen,
  params,
  href,
  children,
  SVGElement,
  style,
  props,
  deckColors
}: LinkButtonProps) {

  /**
   * Sound effect
   */
  const tapPlayer = useAudioPlayer(tapAudio);

  useEffect(() => {
    tapPlayer.volume = 0.2;
  }, [tapPlayer]);

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
  let deckColorStyles = {};

  if (deckColors?.dark && deckColors.light) {
    deckColorStyles = {
      backgroundColor: deckColors.light,
      shadowColor: deckColors.dark,
      borderColor: deckColors.dark
    };
  }

  /**
   * State/prop vars
   */
  const linkProps = useLinkProps({
    screen: screen ?? '',
    params: params ?? {},
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
  async function playTapSound() {
    try {
      await tapPlayer.seekTo(0);
      tapPlayer.play();
    } catch {
      // Shush warning
    }
  }

  /**
   * Side effects
   */
  function handlePressIn() {
    setIsPressed(true);
    playTapSound();
    handler();
  }

  function handlePressOut() {
    setIsPressed(false);
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
   * Pull in props when used for a navigation link button.
   */
  let allTheProps = props;

  if (screen) {
    allTheProps = { ...props, ...linkProps };
  }

  /**
   * Render the thing
   */
  return (
    <Animated.View style={[style, animatedContainerStyle]}>
      <AnimatedPressable
        {...allTheProps}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[currentLinkButtonStyles, deckColorStyles, animatedShadowStyle]}
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
    padding: 16,
    gap: 16,
    shadowColor: colors.dark.border,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  linkText: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
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
  }
})
