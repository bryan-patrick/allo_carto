import { useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { colors } from "../../app/styles";
import { CardDeckContext } from '../CardDeck/cardDeckContext';
import WordCardBack from './WordCardBack';
import { getFeedbackKey, WordCardContext } from './wordCardContext';
import WordCardFront from './WordCardFront';

/**
 * WordCard Component
 * 
 * Note: I couldn't get the parent to flip on its
 * own to do both front and back at the same time,
 * so these are done individually to create the
 * card flip effect.
 */
interface WordCardProps {
  isCurrent: boolean;
}

export default function WordCard({ isCurrent }: WordCardProps) {
  const { wordCard } = wordCardStyles;
  const { cardState, setCardState } = useContext(WordCardContext);
  const { cardDeckDispatch } = useContext(CardDeckContext);

  /**
   * Animation vars
   */
  const articleWidth = useSharedValue(0);
  const wordWidth = useSharedValue(0);
  const flipDegrees = useSharedValue(0);
  const flipDuration = useSharedValue(500);

  /**
   * Animation timing functions
   */
  const timing = useMemo(() => ({
    duration: 120,
    easing: Easing.inOut(Easing.ease)
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

  useLayoutEffect(() => {
    flipDegrees.value = withTiming(
      cardState.progress === 'SUCCESS' ? 180 : 0, {
      duration: cardState.progress === 'SUCCESS' ? flipDuration.value : 0,
      easing: Easing.inOut(Easing.cubic)
    });
  }, [
    flipDegrees,
    flipDuration,
    cardState.progress
  ]);

  /**
   * Trigger the next card on completed
   * This fires when we have the correct state
   * and the user hits the button.
   */
  useEffect(() => {
    if (isCurrent && cardState.stage === 'COMPLETED') {
      cardDeckDispatch({ type: 'next_card' });
    }
  }, [
    isCurrent,
    cardState.stage,
    cardDeckDispatch
  ])

  /**
   * When state changes, update the feedback text
   */
  useLayoutEffect(() => {
    setCardState((prev) => ({ ...prev, ...{ feedback: getFeedbackKey(prev) } }))
  }, [
    setCardState,
    cardState.stage,
    cardState.progress,
    cardState.mistake
  ])

  /**
   * Render the card
   */
  return (
    <View style={wordCard}>
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
  wordCard: {
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
  cardGradient: {
    alignContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 4,
    paddingRight: 8,
    paddingLeft: 8,
    gap: 4,
  },
  cardCEFRLevel: {
    color: colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardUserScore: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMain: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingRight: 8,
    paddingLeft: 8,
    marginTop: 8,
    gap: 8,
  },
  wordId: {
    color: colors.dark.text,
    fontSize: 24,
    fontWeight: '700',
  },
  wordPronunciation: {
    fontSize: 18,
    color: colors.dark.text
  },
  answerSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  answerSlot: {
    borderBottomWidth: 2,
    color: 'transparent',
    padding: 4,
    paddingRight: 12,
    paddingLeft: 12,
    fontWeight: 500,
    fontSize: 18,
  },
  feedbackText: {
    padding: 4,
    fontSize: 18,
    fontWeight: 600,
    marginTop: 8,
    marginBottom: 8,
    color: colors.dark.success
  }
})
