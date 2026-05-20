import { colors } from '@/app/styles';
import { ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CardContext } from './cardContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Typing
 */
interface WordCardButtonProps extends PressableProps {
  handler?: Function;
  SVGElement?: ReactElement;
  children?: ReactNode;
}

/**
 * LinkButton Component
 * A link that looks like a button
 * https://reactnative.dev/docs/components-and-apis
 */

export default function WordCardButton({
  handler = () => { },
  children,
  SVGElement,
  style,
  ...props
}: WordCardButtonProps) {
  const { cardState, setCardState } = useContext(CardContext);

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

  const checkAnswer = () => {
    let isCorrect = true;

    if (cardState.correctArticle && (cardState.correctArticle !== cardState.selectedArticle)) {
      isCorrect = false;
    }

    if (cardState.correctWord !== cardState.selectedWord) {
      isCorrect = false;
    }

    setCardState(prev => {
      return ({
        ...prev, ...{
          isCorrect,
          isIncorrect: !isCorrect
        }
      })
    })

    console.log('answered', cardState);
  }

  /**
   * Action handlers
   */
  function handlePressIn() {
    setIsPressed(true);
    handler();
  }

  function handlePressOut() {
    setIsPressed(false);
    checkAnswer();
  }

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