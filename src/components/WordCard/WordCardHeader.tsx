import colors from "@/src/app/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useCardDeck } from "../CardDeck/useCardDeck";
import WordRank from "../WordRank";
import { sharedWordCardStyles } from "./sharedWordCardStyles";

/**
 * WordCardHeader Component
 */
export default function WordCardHeader() {
  const { /*cardDeckState,*/ currentCard } = useCardDeck();

  // const gradientStart = cardDeckState.cardDeck.colors?.light ?? colors.light.primary;
  // const gradient = cardDeckState.cardDeck.colors?.light ?? colors.light.primary;

  const {
    cardGradient,
    cardCEFRLevel,
    CEFRContainerStyle,
  } = sharedWordCardStyles;

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={[colors.light.primary, colors.dark.border]}
      style={cardGradient}
    >
      <View style={[
        CEFRContainerStyle,
        {
          backgroundColor: colors.light.CEFR[currentCard.CEFR]
        }]}>
        <Text
          style={[
            cardCEFRLevel,
          ]}
        >
          {currentCard.CEFR}
        </Text>
      </View>
      <WordRank />
    </LinearGradient>
  )
}
