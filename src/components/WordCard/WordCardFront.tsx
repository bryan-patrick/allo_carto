import { colors } from "@/src/app/styles";
import { LinearGradient } from 'expo-linear-gradient';
import { useContext } from "react";
import { type LayoutChangeEvent, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import type { AnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { sharedWordCardStyles } from "./WordCard";
import { WordCardContext } from "./wordCardContext";

/**
 * Typing
 */
interface WordCardFrontProps {
  wordWidthStyle: AnimatedStyle<TextStyle>;
  articleWidthStyle: AnimatedStyle<TextStyle>;
  wordCardFrontFlippedStyle: AnimatedStyle<ViewStyle>;
  handleArticleWidth: (event: LayoutChangeEvent) => void;
  handleWordWidth: (event: LayoutChangeEvent) => void;
}

/**
 * WordCardFront component
 */
export default function WordCardFront({
  handleWordWidth,
  handleArticleWidth,
  articleWidthStyle,
  wordCardFrontFlippedStyle,
  wordWidthStyle
}: WordCardFrontProps) {
  const { cardState } = useContext(WordCardContext);

  /**
   * Destructure Styles
   */
  const {
    wordId,
    wordPronunciation,
    cardGradient,
    cardCEFRLevel,
    cardUserScore,
    cardMain,
    cardFront,
    answerSlotContainer,
    answerSlot,
    hiddenMeasureText,
  } = wordCardFrontStyles;

  /**
   * Word data
   */
  const {
    id,
    pronunciation,
    CEFRLevel,
    userScore,
    frenchArticle,
    englishArticle,
    translation
  } = cardState.word;

  /**
   * User selected rendering
   */
  const displayedArticle = cardState.selectedArticle ?? englishArticle ?? '';
  const displayedWord = cardState.selectedWord ?? translation ?? '';
  const articleClass = { color: cardState.selectedArticle ? colors.dark.text : 'transparent' };
  const wordClass = { color: cardState.selectedWord ? colors.dark.text : 'transparent' };

  /**
   * Render the front of the WordCard
   */
  return (
    <Animated.View style={[
      sharedWordCardStyles.wordCardInner,
      cardFront,
      wordCardFrontFlippedStyle
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
          <>
            <Text
              numberOfLines={1}
              onLayout={handleArticleWidth}
              style={[answerSlot, hiddenMeasureText]}
            >
              {displayedArticle}
            </Text>
            <Animated.Text
              numberOfLines={1}
              style={[answerSlot, articleClass, articleWidthStyle]}
            >
              {displayedArticle}
            </Animated.Text>
          </>
        )}
        <Text
          numberOfLines={1}
          onLayout={handleWordWidth}
          style={[answerSlot, hiddenMeasureText]}
        >
          {displayedWord}
        </Text>
        <Animated.Text
          numberOfLines={1}
          style={[answerSlot, wordClass, wordWidthStyle]}
        >
          {displayedWord}
        </Animated.Text>
      </View>
    </Animated.View>
  )
}

/**
 * Styles
 */
export const wordCardFrontStyles = StyleSheet.create({
  cardFront: {
    zIndex: 1,
    backfaceVisibility: 'hidden',
    transform: [
      { perspective: 1000 },
      { rotateY: '0deg' }
    ]
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
    marginBottom: 12
  },
  answerSlot: {
    borderBottomWidth: 2,
    color: 'transparent',
    paddingRight: 8,
    paddingLeft: 8,
    fontWeight: 500,
    fontSize: 18
  },
  hiddenMeasureText: {
    position: 'absolute',
    opacity: 0,
    borderBottomWidth: 0
  }
});
