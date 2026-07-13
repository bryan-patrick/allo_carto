import { useLinkProps } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from '../app/colors';
import type { DeckColors } from './CardDeck/cardDeckTypes';
import SVGRightArrow from './SVG/SVGRightArrow';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const linkButtonShadowHeight = 8;

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
  deckColors?: DeckColors;
  arrowSize?: number;
  useArrow?: boolean;
  arrowColor?: string;
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
  useArrow = true,
  arrowSize = 24,
  disabled = false,
  arrowColor = colors.light.text,
  deckColors,
  ...pressableProps
}: LinkButtonProps) {

  /**
   * Sound effect
   */
  const tapPlayer = useAudioPlayer(tapAudio);

  useEffect(() => {
    tapPlayer.volume = 0.2;
  }, [ tapPlayer ]);

  /**
   * Destructure styles
   */
  const {
    linkButton,
    linkText,
    linkTextRow,
  } = styles;
  let deckColorStyles = {};

  if (deckColors) {
    deckColorStyles = {
      backgroundColor: deckColors.dark.secondary,
      shadowColor: deckColors.dark.primary,
      borderColor: deckColors.dark.primary
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

  const [ isPressed, setIsPressed ] = useState(false);

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const shadowOffsetHeight = useSharedValue(linkButtonShadowHeight);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    top: top.value,
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
      shadowOffsetHeight.value = linkButtonShadowHeight;
    }

  }, [ isPressed, shadowOffsetHeight, top ]);

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
   * Pull in props when used for a navigation link button.
   */
  let allTheProps = { ...pressableProps, ...props };

  if (screen) {
    allTheProps = { ...pressableProps, ...props, ...linkProps };
  }

  const {
    onPress: buttonPress,
    onPressIn: buttonPressIn,
    onPressOut: buttonPressOut,
    ...buttonProps
  } = allTheProps;

  function LinkText() {
    const labelText = typeof children === 'string'
      ? children.replace(/\s*→\s*$/, '')
      : children;

    return (
      <View style={linkTextRow}>
        <Text style={linkText}>{labelText}</Text>
        {useArrow && (
          <SVGRightArrow height={String(arrowSize)} width={String(arrowSize)} color={arrowColor} />
        )}
      </View>
    );
  }

  /**
   * Render the thing
   */
  return (
    <AnimatedPressable
      {...buttonProps}
      onPress={(event) => {
        handler();
        buttonPress?.(event);
      }}
      onPressIn={(event) => {
        setIsPressed(true);
        playTapSound();
        buttonPressIn?.(event);
      }}
      onPressOut={(event) => {
        setIsPressed(false);
        buttonPressOut?.(event);
      }}
      style={[ linkButton, deckColorStyles, animatedButtonStyle, style ]}
      disabled={disabled}
    >
      {SVGElement}
      <LinkText />
    </AnimatedPressable>
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
    padding: 12,
    gap: 8,
    shadowColor: colors.dark.border,
    shadowOffset: { width: 0, height: linkButtonShadowHeight },
    marginBottom: linkButtonShadowHeight,
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  linkText: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    fontSize: 14,
  },
  linkTextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
