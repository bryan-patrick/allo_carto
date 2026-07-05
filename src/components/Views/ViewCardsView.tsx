import sharedStyles from "@/src/app/sharedStyles";
import type { CardDeck } from "@/src/components/CardDeck/cardDeckTypes";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import GradientText from "../GradientText";

interface ViewCardsViewProps {
  deck?: CardDeck;
}

/**
 * ViewCardsView component
 */
export default function ViewCardsView({ deck }: ViewCardsViewProps) {
  const {
    containerStyle,
    cardStyle,
    titleStyle,
    metaTextStyle,
  } = styles;

  const title = deck?.title ?? 'Some Deck';
  const cardCount = deck?.wordIds.length ?? 0;

  return (
    <ScrollView contentContainerStyle={containerStyle}>
      <View style={cardStyle}>
        {deck && (
          <>
            <GradientText
              colors={[deck.colors.dark.primary, deck.colors.dark.secondary]}
              fontSize={22}
              fontWeight={700}
              text={title}
            />
            <Text style={metaTextStyle}>{cardCount} cards</Text>
          </>
        )}
        {!deck && (
          <>
            <Text style={titleStyle}>{title}</Text>
            <Text style={metaTextStyle}>Deck not found.</Text>
          </>
        )}
      </View>
    </ScrollView>
  )
}

/**
 * Shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  containerStyle: {
    padding: containerMargin,
  },
  cardStyle: {
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderRadius: 8,
    borderWidth: 4,
    boxShadow: `0 12px 0 ${colors.dark.border}`,
    gap: 8,
    padding: 16,
  },
  titleStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-700',
    fontSize: 22,
  },
  metaTextStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-400',
    fontSize: 14,
  },
});
