import { colors } from "@/src/app/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useContext } from "react";
import { type ViewStyle, StyleSheet, Text, View } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { sharedWordCardStyles } from "./WordCard";
import { FEEDBACK_TEXT_BACK, WordCardContext } from "./wordCardContext";

/**
 * Typing
 */
interface WordCardBackProps {
  wordCardBackFlippedStyle: AnimatedStyle<ViewStyle>
}

/**
 * WordCardBack Component
 */
export default function WordCardBack({
  wordCardBackFlippedStyle
}: WordCardBackProps) {
  const { cardState } = useContext(WordCardContext);

  /**
   * Destructure Styles
   */
  const {
    cardBack,
    answerSlotBack
  } = wordCardBackStyles;

  const {
    wordId,
    wordPronunciation,
    cardGradient,
    cardCEFRLevel,
    cardUserScore,
    cardMain,
    answerSlotContainer,
    answerSlot,
    feedbackText
  } = sharedWordCardStyles;

  /**
   * Word data
   */
  const {
    id,
    translation,
    pronunciation,
    CEFRLevel,
    userScore,
    englishArticle,
    frenchArticle,
  } = cardState.word;

  /**
   * Render the back of the WordCard
   */
  return (
    <Animated.View style={[
      sharedWordCardStyles.wordCardInner,
      cardBack,
      wordCardBackFlippedStyle
    ]}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[colors.light.primary, colors.dark.border]}
        style={cardGradient}
      >
        <Text style={cardCEFRLevel}>{CEFRLevel}</Text>
        <Text style={cardUserScore}>{userScore}</Text>
      </LinearGradient>
      <View style={cardMain}>
        <Text style={wordId}>{frenchArticle}&nbsp;{id}</Text>
        <Text style={wordPronunciation}>({pronunciation})</Text>
      </View>
      <View style={answerSlotContainer}>
        {englishArticle && (
          <Text
            numberOfLines={1}
            style={[answerSlot, answerSlotBack]}
          >
            {englishArticle}
          </Text>
        )}
        <Text
          numberOfLines={1}
          style={[answerSlot, answerSlotBack]}
        >
          {translation}
        </Text>
      </View>
      <View>
        <Text style={feedbackText}>{FEEDBACK_TEXT_BACK[cardState.feedback]}</Text>
      </View>
    </Animated.View>
  )
}

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
  },
  answerSlotBack: {
    color: colors.dark.success,
    backgroundColor: colors.light.success,
    boxShadow: `0 4px 4px 0 ${colors.light.border}`,
    borderTopWidth: 2,
    borderTopColor: colors.dark.success,
  }
});