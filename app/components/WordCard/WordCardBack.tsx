import { colors } from "@/app/styles";
import { type ViewStyle, StyleSheet, Text } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { WordProps, wordCardInnerStyles } from "./WordCard";

interface WordCardBackProps {
  word: WordProps;
  wordCardBackFlippedStyle: AnimatedStyle<ViewStyle>
}

export default function WordCardBack({
  word,
  wordCardBackFlippedStyle
}: WordCardBackProps) {
  const { cardBack } = wordCardBackStyles;

  return (
    <Animated.View style={[
      wordCardInnerStyles.wordCardInner,
      cardBack,
      wordCardBackFlippedStyle
    ]}>
      <Text>CARD BACK</Text>
    </Animated.View>
  )
}

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