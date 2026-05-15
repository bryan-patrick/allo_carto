import { useLinkProps } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { LinkProps } from 'expo-router';
import { ReactElement, ReactNode, useState } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import styles, { colors } from '../styles';

interface LinkButtonProps {
  screen: string;
  params: LinkProps;
  SVGElement?: ReactElement;
  action?: Readonly<any>;
  href?: string;
  children?: ReactNode;
}

const tapAudio = require('../assets/sounds/tap.wav');

/**
 * A link that looks like a button
 */
export default function LinkButton({
  screen,
  params,
  action,
  href,
  children,
  SVGElement,
  ...moreProps }: LinkButtonProps) {
  /**
   * Sound effect
   */
  const tapPlayer = useAudioPlayer(tapAudio);
  tapPlayer.volume = 0.2;

  /**
   * Style vars
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
  const props = useLinkProps({ screen, params, action, href });
  const allTheProps = { ...props, ...moreProps };
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const boxShadow = useSharedValue(`8px 8px 0 0 ${colors.dark.border}`);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    top: top.value,
    boxShadow: boxShadow.value,
    borderRadius: 8
  }));

  /**
   * Action handlers
   */
  function handlePressIn() {
    top.value = withTiming(4, {
      duration: 120,
      easing: Easing.inOut(Easing.quad),
    });

    boxShadow.value = withTiming(`0px 0px 0 0 ${colors.dark.border}`, {
      duration: 60,
      easing: Easing.out(Easing.quad),
    });

    setIsPressed(true);
    tapPlayer.seekTo(0);
    tapPlayer.play();
  }

  function handlePressOut() {
    top.value = 0;
    boxShadow.value = `8px 8px 0 0 ${colors.dark.border}`;
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

  return (
    <Animated.View style={animatedButtonStyle}>

      <Pressable
        {...allTheProps}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={currentLinkButtonStyles}
      >
        {SVGElement}
        <Text style={currentLinkTextStyles}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
};