import colors from "@/src/app/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";
import { useCardDeck } from "../CardDeck/useCardDeck";
import WordRank from "../WordRank";
import { sharedWordCardStyles } from "./sharedWordCardStyles";

/**
 * WordCardHeader Component
 */
export default function WordCardHeader() {
  const { currentCard } = useCardDeck();

  const {
    cardGradient,
    cardCEFRLevel,
  } = sharedWordCardStyles;

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={[colors.light.primary, colors.dark.border]}
      style={cardGradient}
    >
      <Text style={cardCEFRLevel}>{currentCard.CEFR}</Text>
      <WordRank />
    </LinearGradient>
  )
}
