import LinkButton from "@/src/components/LinkButton";
import { StyleSheet, View } from "react-native";
import type { CardDeck } from "../CardDeck/cardDeckTypes";

interface DeckBoxFooterProps {
  deck: CardDeck;
  handleDeckSelect: (deck: CardDeck) => Promise<void>;
}

/**
 * DeckBoxFooter component
 */
export default function DeckBoxFooter({
  deck,
  handleDeckSelect,
}: DeckBoxFooterProps) {
  const {
    cardFooterStyle,
  } = styles;

  return (
    <View style={cardFooterStyle}>
      {
        /**
         * Review Link
         */
      }
      <LinkButton
        handler={() => handleDeckSelect(deck)}
        deckColors={deck.colors}
      >
        Review this deck
      </LinkButton>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardFooterStyle: {
    padding: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
