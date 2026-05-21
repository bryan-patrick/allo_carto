import { colors } from '@/src/app/styles';
import { ReactElement, ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CardMistake, WordCardContext } from './wordCardContext';

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
      case 'ERROR':
        setPressableStateStyle(errorPressable);
        setTextStateStyle(errorText);
        break;
      case 'PENDING':
        setPressableStateStyle({});
        setTextStateStyle({});
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
    if (cardState.stage === 'READY') {
      /**
       * Determine if there was a mistake
       */
      let mistake: CardMistake = 'NONE';

      if (
        (cardState.correctArticle) &&
        (cardState.correctArticle !== cardState.selectedArticle)
      ) {
        mistake = 'ARTICLE';
      }

      if (cardState.correctWord !== cardState.selectedWord) {
        mistake = mistake === 'ARTICLE' ? 'BOTH' : 'WORD';
      }

      /**
       * Set card state
       */
      if (mistake !== 'NONE') {
        setCardState(prev => ({
          ...prev, ...{
            progress: 'WARNING',
            mistake,
          }
        }));
      } else {
        setCardState(prev => ({
          ...prev, ...{
            progress: 'SUCCESS',
            stage: 'CORRECT',
          }
        }));
      }
    } else if (cardState.stage === 'CORRECT') {
      setCardState(prev => ({
        ...prev, ...{
          progress: 'SUCCESS',
          stage: 'COMPLETED',
        }
      }));
    }


  }, [
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
        disabled={cardState.progress === 'WARNING' || cardState.progress === 'ERROR'}
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
    backgroundColor: colors.light.error,
    borderColor: colors.light.error,
    shadowColor: colors.dark.error,
  },
  successText: {
    color: colors.dark.text
  },
  warningText: {
    color: colors.dark.warning,
  },
  errorText: {
    color: colors.dark.error,
  },
});