import colors from "@/src/app/colors";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useCardDeck } from "../CardDeck/useCardDeck";
import WordRank from "../WordRank";

/**
 * WordCardHeader Component
 */
export default function WordCardHeader() {
  const { /*cardDeckState,*/ currentCard } = useCardDeck();

  // const gradientLight = cardDeckState.cardDeck.colors?.light ?? colors.light.primary;
  // const gradientDark = cardDeckState.cardDeck.colors?.dark ?? colors.dark.primary;

  /**
   * Destructure styles
   */
  const { rarity = 'Common' } = currentCard;

  const {
    cardHeaderContainer,
    cardCEFRLevel,
    CEFRContainerStyle,
    rarityContainerStyle,
    rarityTextStyle
  } = styles;

  return (
    <View style={cardHeaderContainer}>
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
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[colors.rarity[rarity], colors.light.primary, colors.dark.primary]}
        locations={[0.25, 0.65, 1]}
        style={rarityContainerStyle}
      >
        <Text style={rarityTextStyle}>{rarity}</Text>
      </LinearGradient>
      <WordRank />
    </View>
  )
}

const styles = StyleSheet.create({
  cardHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderColor: colors.light.border,
  },
  CEFRContainerStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderRightWidth: 1,
  },
  cardCEFRLevel: {
    width: '100%',
    paddingRight: 8,
    paddingLeft: 8,
    fontFamily: 'azeret-mono-600',
    fontSize: 14,
    borderColor: colors.light.border,
  },
  rarityContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 8,
    flexGrow: 1
  },
  rarityTextStyle: {
    fontFamily: 'azeret-mono-400',
  }
});
