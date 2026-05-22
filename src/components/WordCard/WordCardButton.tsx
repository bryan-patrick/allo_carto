import { colors } from '@/src/app/styles';
import { ReactElement, ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CardMistake, WordCardContext, WordCardStateProps } from './wordCardContext';

/**
 * I guess there's no Animated.Pressable?
 * I don't know the rules. This works though.
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
  const { cardState, setCardState } = useContext(WordCardContext);
  const [pressableStateStyle, setPressableStateStyle] = useState<ViewStyle | null>({});
  const [textStateStyle, setTextStateStyle] = useState<TextStyle | null>({});
  /**
   * Style vars
   */
  const {
    containerStyles,
    pressableStyles,
    successPressable,
    warningPressable,
    errorPressable,
    warningText,
    errorText,
    textStyles,
    successText,
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
      case 'WARNING': {
        setPressableStateStyle(warningPressable);
        setTextStateStyle(warningText);
        break;
      }
      case 'DANGER':
        setPressableStateStyle(errorPressable);
        setTextStateStyle(errorText);
        break;
    }
  }, [
    successText,
    warningText,
    errorText,
    successPressable,
    warningPressable,
    errorPressable,
    cardState.progress,
  ]);

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
    let updates: Partial<WordCardStateProps> | null = null;
    let mistake: CardMistake = 'NONE';

    /**
     * What we do depends on what stage the card is in.
     */
    switch (cardState.stage) {
      /**
       * READY is initial value, so this is the first time
       * the user hit the 'Check' button. Check if the user 
       * got the right answer or made a mistake.
       */
      case 'READY':
        if (
          cardState.correctArticle &&
          cardState.correctArticle !== cardState.selectedArticle
        ) mistake = 'ARTICLE';

        if (cardState.correctWord !== cardState.selectedWord) {
          mistake = mistake === 'ARTICLE' ? 'BOTH' : 'WORD';
        }

        if (mistake !== 'NONE')
          updates = { progress: 'WARNING', mistake };
        else
          updates = { progress: 'SUCCESS', stage: 'CORRECT' };
        break;

      /**
       * CORRECT means We were already showing the user 
       * the other side of the card (with correct answers). 
       * Mark this one completed.
       */
      case 'CORRECT':
        updates = { progress: 'SUCCESS', stage: 'COMPLETED' };
        break;

      /**
       * INCORRECT means the user got it wrong and
       * ran out of attempts. Progress the card 
       * without upping the word score. TODO
       */
      case 'INCORRECT':
        updates = { progress: 'DANGER', stage: 'COMPLETED' }
        break;
    }

    /**
     * Check if the user has reached
     * the max allowed attempts.
     */
    if (
      cardState.attempts + 1 >= cardState.maxAttempts &&
      mistake !== 'NONE'
    ) {
      updates = { progress: 'DANGER', stage: 'INCORRECT', mistake }
    }

    /**
     * Update the card's state and 
     * increment the user's attempts.
     */
    if (updates) {
      setCardState(prev => ({
        ...prev,
        ...updates,
        attempts: prev.attempts + 1,
      }));
    }
  }, [
    cardState.maxAttempts,
    cardState.attempts,
    cardState.stage,
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
    checkAnswer();
  }, [checkAnswer]);

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
        disabled={cardState.progress === 'WARNING'}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          pressableStyles,
          pressableStateStyle,
          animatedShadowStyle,
        ]}
      >
        {SVGElement}
        <Text
          style={[
            textStyles,
            textStateStyle,
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
  warningPressable: {
    backgroundColor: colors.light.warning,
    borderColor: colors.light.warning,
    shadowColor: colors.dark.warning,
  },
  errorPressable: {
    backgroundColor: colors.light.danger,
    borderColor: colors.light.danger,
    shadowColor: colors.dark.danger,
  },
  successText: {
    color: colors.dark.text
  },
  warningText: {
    color: colors.dark.warning,
  },
  errorText: {
    color: colors.dark.danger,
  },
});
