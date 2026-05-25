import { colors } from "@/src/app/styles";
import { memo } from "react";
import { type ViewStyle, StyleSheet, Text, TextStyle, View } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { useCardDeck } from "../CardDeck/useCardDeck";
import { sharedWordCardStyles } from "./sharedWordCardStyles";
import { useWordCardUI } from "./useWordCardUI";
import { FEEDBACK_TEXT_BACK } from "./wordCardContext";
import WordCardHeader from "./WordCardHeader";

/**
 * Typing
 */
interface WordCardBackProps {
  wordCardBackFlippedStyle: AnimatedStyle<ViewStyle>
  feedbackStyle: TextStyle;
  articleSlotStyle: TextStyle;
  wordSlotStyle: TextStyle;
}

/**
 * WordCardBack Component
 */
const WordCardBack = memo(function WordCardBackMemo({
  wordCardBackFlippedStyle,
  feedbackStyle,
  articleSlotStyle,
  wordSlotStyle
}: WordCardBackProps) {
  const { cardState } = useWordCardUI();
  const { currentCard } = useCardDeck();

  /**
   * Destructure Styles
   */
  const { cardBack } = wordCardBackStyles;

  const {
    wordId,
    wordPronunciation,
    cardMain,
    answerSlotContainer,
    answerSlot,
    feedbackContainer,
    feedbackText,
  } = sharedWordCardStyles;

  /**
   * Word data
   */
  const {
    englishWord,
    pronunciation,
    englishArticle,
    frenchArticle,
  } = currentCard;

  /**
   * Render the back of the WordCard
   */
  return (
    <Animated.View style={[
      sharedWordCardStyles.wordCardInner,
      cardBack,
      wordCardBackFlippedStyle
    ]}>
      <WordCardHeader />
      <View style={cardMain}>
        <Text style={wordId}>{frenchArticle}&nbsp;{englishWord}</Text>
        <Text style={wordPronunciation}>({pronunciation})</Text>
      </View>
      <View style={answerSlotContainer}>
        {englishArticle && (
          <Text
            numberOfLines={1}
            style={[
              answerSlot,
              articleSlotStyle
            ]}
          >
            {englishArticle}
          </Text>
        )}
        <Text
          numberOfLines={1}
          style={[
            answerSlot,
            wordSlotStyle
          ]}
        >
          {englishWord}
        </Text>
      </View>
      <View style={feedbackContainer}>
        <Text style={[feedbackText, feedbackStyle]}>
          {FEEDBACK_TEXT_BACK[cardState.feedbackKey] ?? ''}
        </Text>
      </View>
    </Animated.View>
  )
});

/**
 * Export memoized
 */
export default WordCardBack;

/**
 * Styles
 */
const wordCardBackStyles = StyleSheet.create({
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: [
      { perspective: 1000 },
      { rotateY: '180deg' }
    ]
  },
  cardBackSuccess: {
    backgroundColor: colors.light.success,
  }
});
