import { colors } from '@/src/app/styles';
import { ReactElement, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { WordCardContext } from './wordCardContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Typing
 */
interface WordCardButtonProps extends PressableProps {
  SVGElement?: ReactElement;
  children?: ReactNode;
}

/**
 * WordCardButton Component
 * Handles checking/next card actions
 * https://reactnative.dev/docs/components-and-apis
 */
export default function WordCardButton({
  children,
  SVGElement,
  style,
  ...props
}: WordCardButtonProps) {
  const { cardState, setCardState } = useContext(WordCardContext);

  /**
   * Style vars
   */
  const {
    containerStyles,
    pressableStyles,
    successPressable,
    textStyles,
    successText
  } = wordCardButtonStyles;

  /**
   * State/prop vars
   */
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
   * Check the user's answer
   */
  const checkAnswer = useCallback(() => {
    let isCorrect = true;

    if (
      cardState.correctArticle &&
      (cardState.correctArticle !== cardState.selectedArticle)
    ) {
      isCorrect = false;
    }

    if (cardState.correctWord !== cardState.selectedWord) {
      isCorrect = false;
    }

    setCardState(prev => ({ ...prev, ...{ isCorrect } }));
  }, [
    cardState.correctArticle,
    cardState.selectedArticle,
    cardState.selectedWord,
    cardState.correctWord,
    setCardState,
  ]);

  /**
   * Action handlers
   */
  const handlePressIn = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);

    if (!cardState.isCorrect) {
      checkAnswer();
    } else {
      setCardState(prev => ({ ...prev, ...{ isCompleted: true } }));
    }
  }, [
    cardState.isCorrect,
    setCardState,
    checkAnswer
  ]);

  /**
   * Handle pressed button style only side effects
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

  }, [isPressed, shadowOffsetHeight, top]);

  /**
   * Render the WordCard
   */
  return (
    <Animated.View style={[containerStyles, animatedContainerStyle]}>
      <AnimatedPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          pressableStyles,
          animatedShadowStyle,
          cardState.isCorrect ? successPressable : ''
        ]}
      >
        {SVGElement}
        <Text style={[
          textStyles,
          cardState.isCorrect ? successText : ''
        ]}>{children}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

/**
 * Styles
 */
const wordCardButtonStyles = StyleSheet.create({
  containerStyles: {
    margin: 24
  },
  pressableStyles: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.primary,
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    gap: 16,
    shadowColor: colors.dark.border,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  textStyles: {
    color: colors.light.text,
    fontWeight: '800',
    fontSize: 16,
  },
  successPressable: {
    backgroundColor: colors.light.success,
    shadowColor: colors.light.border,
  },
  successText: {
    color: colors.dark.text
  }
})