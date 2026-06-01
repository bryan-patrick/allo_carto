import colors from '@/src/app/colors';
import { incrementCorrectCount } from '@/src/db/queries/incrementCorrectCount';
import { useUserContext } from '@/src/db/useUserContext';
import * as Haptics from 'expo-haptics';
import { ReactElement, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useCardDeck } from '../CardDeck/useCardDeck';
import { useWordCardUI } from './useWordCardUI';

/**
 * Essentially Animated.Pressable
 */
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
 */
export default function WordCardButton({
  children,
  SVGElement,
  style,
  ...props
}: WordCardButtonProps) {
  const user = useUserContext();
  const { cardState, wordCardUIDispatch } = useWordCardUI();
  const { cardDeckDispatch, currentCard } = useCardDeck();
  const [pressableStateStyle, setPressableStateStyle] = useState<ViewStyle | null>({});
  const [textStateStyle, setTextStateStyle] = useState<TextStyle | null>({});

  /**
   * Style vars
   */
  const {
    containerStyles,
    pressableStyles,
    successPressable,
    disabledPressable,
    textStyles,
    successText,
    disabledText,
  } = wordCardButtonStyles;

  /**
   * Eval current style
   */
  useLayoutEffect(() => {
    switch (cardState.progress) {
      case 'PENDING':
        setPressableStateStyle({});
        setTextStateStyle({});
        break;
      case 'SUCCESS': {
        setPressableStateStyle(successPressable);
        setTextStateStyle(successText);
        break;
      }
    }
  }, [
    successText,
    successPressable,
    cardState.progress,
  ]);

  /**
   * State/prop vars
   */
  const [isPressed, setIsPressed] = useState(false);

  const isDisabled = useMemo(() => {
    if (
      cardState.progress === 'WARNING' ||
      (currentCard.englishArticle && !cardState.selectedArticle) ||
      !cardState.selectedWord) {
      return true;
    } return false;
  }, [
    currentCard.englishArticle,
    cardState.progress,
    cardState.selectedArticle,
    cardState.selectedWord
  ]);

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
    wordCardUIDispatch({ type: 'CHECK_ANSWER', currentCard });
  }, [
    currentCard,
    wordCardUIDispatch,
  ]);

  /**
   * Side effects (and haptics) for dispatching check answer
   */
  useEffect(() => {
    async function udateUserScore() {
      if (user) {
        await incrementCorrectCount(user.id, currentCard.id);
      }

    }

    if (cardState.attempts !== 0) {
      switch (`${cardState.stage}_${cardState.progress}`) {
        case 'CORRECT_SUCCESS':
          cardDeckDispatch({ type: 'INCREMENT_WORD_SCORE' });
          udateUserScore();
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          break;
        case 'READY_WARNING':
        case 'INCORRECT_DANGER':
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          break;
        case 'COMPLETED_DANGER':
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          break;
      }
    }
  }, [
    user?.id,
    currentCard.id,
    cardState.attempts,
    cardState.progress,
    cardState.stage,
    cardDeckDispatch,
  ]);

  /**
   * Action handlers
   */
  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    checkAnswer();
  }, [checkAnswer]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  /**
   * Side effect that sets the styles 
   * when a user presses the button.
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
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={10}
        style={[
          pressableStyles,
          pressableStateStyle,
          animatedShadowStyle,
          isDisabled && disabledPressable
        ]}
      >
        {SVGElement}
        <Text
          style={[
            textStyles,
            textStateStyle,
            isDisabled && disabledText
          ]}>
          {children}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

/**
 * Styles
 */
const wordCardButtonStyles = StyleSheet.create({
  containerStyles: {

  },
  pressableStyles: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.primary,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
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
  disabledPressable: {
    backgroundColor: colors.dark.border,
    top: 6,
    shadowColor: 'transparent',
  },
  successText: {
    color: colors.dark.text
  },
  disabledText: {
    color: colors.light.border,
  }
});
