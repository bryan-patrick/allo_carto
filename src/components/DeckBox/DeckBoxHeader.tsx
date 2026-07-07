import { StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import type { CardDeck } from "../CardDeck/cardDeckTypes";
import GradientText from "../GradientText";

interface DeckBoxHeaderProps {
  deck: CardDeck;
}

/**
 * DeckBoxHeader component
 */
export default function DeckBoxHeader({ deck }: DeckBoxHeaderProps) {
  const {
    cardHeaderStyle,
    titleContainer,
    gradientTextContainer,
    descriptionStyle,
  } = styles;

  return (
    <View style={cardHeaderStyle}>
      <View style={titleContainer}>
        <View style={gradientTextContainer}>
          <GradientText
            fontSize={20}
            fontWeight={700}
            colors={[
              deck.colors.dark.primary,
              deck.colors.dark.secondary,
            ]}
            text={deck.title}
          />
        </View>
      </View>
      <Text style={descriptionStyle}>{deck.description}</Text>
    </View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardHeaderStyle: {
    padding: 16,
    gap: 4,
  },
  titleContainer: {
  },
  gradientTextContainer: {
    display: 'flex',
    flexShrink: 1,
    justifyContent: 'center',
  },
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontFamily: 'lexend-400',
  },
});
