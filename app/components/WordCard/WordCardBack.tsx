import { colors } from "@/app/styles";
import { useContext } from "react";
import { type ViewStyle, StyleSheet, Text } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { sharedWordCardStyles } from "./WordCard";
import { CardContext } from "./cardContext";

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
  const { cardState } = useContext(CardContext);

  /**
   * Destructure Styles
   */
  const { cardBack } = wordCardBackStyles;

  /**
   * Word data
   */
  const {
    translation
  } = cardState.word;

  /**
   * Render the front of the WordCard
   */
  return (
    <Animated.View style={[
      sharedWordCardStyles.wordCardInner,
      cardBack,
      wordCardBackFlippedStyle
    ]}>
      <Text>{translation}</Text>
    </Animated.View>
  )
}

/**
 * Styles
 */
const wordCardBackStyles = StyleSheet.create({
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