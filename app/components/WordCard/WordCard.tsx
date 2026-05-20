import { useContext, useEffect, useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { colors } from "../../styles";
import { CardContext } from './cardContext';
import WordCardBack from './WordCardBack';
import WordCardFront from './WordCardFront';

/**
 * WordCard Component
 * 
 * Note: I couldn't get the parent to flip on its
 * own to do both front and back at the same time,
 * so these are done individually to create the
 * card flip effect.
 */
export default function WordCard() {
  const { wordCardContainer } = wordCardStyles;
  const { cardState } = useContext(CardContext);

  /**
   * Animation vars
   */
  const articleWidth = useSharedValue(0);
  const wordWidth = useSharedValue(0);
  const flipDegrees = useSharedValue(0);

  /**
   * Animation timing functions
   */
  const timing = useMemo(() => ({
    duration: 120,
    easing: Easing.inOut(Easing.ease)
  }), []);

  const flipTiming = useMemo(() => ({
    duration: 450,
    easing: Easing.inOut(Easing.cubic)
  }), []);

  /**
   * Animation styles
   */
  const articleWidthStyle = useAnimatedStyle(() => ({
    width: articleWidth.value
  }));

  const wordWidthStyle = useAnimatedStyle(() => ({
    width: wordWidth.value
  }));

  const wordCardFrontFlippedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `-${flipDegrees.value}deg` }
    ]
  }))

  const wordCardBackFlippedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `-${180 + flipDegrees.value}deg` }
    ]
  }))

  /**
   * Handle setting the animated width of the selected word/article
   * And the flip (These are side effects).
   */
  const handleArticleWidth = (event: LayoutChangeEvent) => {
    articleWidth.value = withTiming(event.nativeEvent.layout.width, timing);
  };

  const handleWordWidth = (event: LayoutChangeEvent) => {
    wordWidth.value = withTiming(event.nativeEvent.layout.width, timing);
  };

  useEffect(() => {
    flipDegrees.value = withTiming(cardState.isCorrect ? 180 : 0, flipTiming);
  }, [cardState.isCorrect, flipDegrees, flipTiming])

  /**
   * Render the card
   */
  return (
    <View style={wordCardContainer}>
      <WordCardFront
        handleWordWidth={handleWordWidth}
        handleArticleWidth={handleArticleWidth}
        articleWidthStyle={articleWidthStyle}
        wordWidthStyle={wordWidthStyle}
        wordCardFrontFlippedStyle={wordCardFrontFlippedStyle}
      />
      <WordCardBack
        wordCardBackFlippedStyle={wordCardBackFlippedStyle}
      />
    </View>
  )
}

/**
 * Styles
 */
const wordCardStyles = StyleSheet.create({
  wordCardContainer: {
    margin: 24,
    borderRadius: 8,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.light.border,
    zIndex: 10,
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: [
      { perspective: 1000 },
      { rotateY: '180deg' }
    ]
  },
});

/**
 * Shared style - front and back of cards
 */
export const sharedWordCardStyles = StyleSheet.create({
  wordCardInner: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 8,
  },
})