import { router } from 'expo-router';
import { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, TextStyle, View } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { colors } from "../../app/styles";
import { CardDeckContext } from '../CardDeck/cardDeckContext';
import { sharedWordCardStyles } from './sharedWordCardStyles';
import { useWordCardUI } from './useWordCardUI';
import WordCardBack from './WordCardBack';
import WordCardFront from './WordCardFront';

/**
 * Typing
 */
interface WordCardProps {
  isCurrent: boolean;
}

/**
 * WordCard Component
 * 
 * Note: I couldn't get the parent to flip on its
 * own to do both front and back at the same time,
 * so these are done individually to create the
 * card flip effect.
 */
export default function WordCard({ isCurrent }: WordCardProps) {
  /**
   * State
   */
  const { cardState } = useWordCardUI();
  const { cardDeckState, cardDeckDispatch } = useContext(CardDeckContext);
  const [feedbackStyle, setFeedbackStyle] = useState({});
  const [articleSlotStyle, setArticleSlotStyle] = useState<TextStyle>({});
  const [wordSlotStyle, setWordSlotStyle] = useState<TextStyle>({});

  /**
   * Styles
  */
  const {
    feedbackSuccess,
    feedbackWarning,
    feedbackError,
    answerSlotSuccess,
    answerSlotWarning,
    answerSlotError
  } = sharedWordCardStyles;
  const { wordCard } = wordCardStyles;

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

  /**
   * Handle the card flip
   */
  useLayoutEffect(() => {
    const shouldFlip =
      cardState.progress === 'SUCCESS'

    flipDegrees.value = withTiming(
      shouldFlip ? 180 : 0, {
      duration: shouldFlip ? flipDuration.value : 0,
      easing: Easing.inOut(Easing.cubic)
    });
  }, [
    flipDegrees,
    flipDuration,
    cardState.progress
  ]);

  /**
   * Trigger the next card on 'COMPLETED'.
   * This fires when we have the correct state
   * and the user hits the 'Next Card ->' button.
   */
  useEffect(() => {
    if (isCurrent && cardState.stage === 'COMPLETED') {
      if (cardDeckState.currentIndex === cardDeckState.cardDeck.words.length - 1) {
        router.push('/FinishedDeck');
      } else {
        cardDeckDispatch({ type: 'NEXT_CARD' });
      }
    }
  }, [
    cardDeckState,
    isCurrent,
    cardState.stage,
    cardDeckDispatch
  ])

  /**
   * Handle slots and feedback styles.
   * Then update our card state.
   * 
   * (The slots are the things on the
   * front of the card with a border 
   * bottom where the words go)
   */
  useLayoutEffect(() => {
    const hasArticleMistake =
      (cardState.mistake === 'ARTICLE') ||
      (cardState.mistake === 'BOTH');

    const hasWordMistake =
      (cardState.mistake === 'WORD') ||
      (cardState.mistake === 'BOTH');

    switch (cardState.progress) {
      case 'PENDING':
        setArticleSlotStyle({});
        setWordSlotStyle({});
        setFeedbackStyle({});
        break;
      case 'SUCCESS':
        setArticleSlotStyle(answerSlotSuccess);
        setWordSlotStyle(answerSlotSuccess);
        setFeedbackStyle(feedbackSuccess);
        break;
      case 'WARNING':
        setFeedbackStyle(feedbackWarning);
        if (hasArticleMistake) setArticleSlotStyle(answerSlotWarning);
        if (hasWordMistake) setWordSlotStyle(answerSlotWarning)
        break;
      case 'DANGER':
        setFeedbackStyle(feedbackError);
        setArticleSlotStyle(answerSlotSuccess);
        setWordSlotStyle(answerSlotSuccess);
        if (hasArticleMistake) setArticleSlotStyle(answerSlotError);
        if (hasWordMistake) setWordSlotStyle(answerSlotError)
        break;
    }
  }, [
    feedbackSuccess,
    answerSlotSuccess,
    cardState.progress,
    cardState.mistake,
    answerSlotError,
    answerSlotWarning,
    feedbackError,
    feedbackWarning,
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
        feedbackStyle={feedbackStyle}
        articleSlotStyle={articleSlotStyle}
        wordSlotStyle={wordSlotStyle}
      />
      <WordCardBack
        wordCardBackFlippedStyle={wordCardBackFlippedStyle}
        feedbackStyle={feedbackStyle}
        articleSlotStyle={articleSlotStyle}
        wordSlotStyle={wordSlotStyle}
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
