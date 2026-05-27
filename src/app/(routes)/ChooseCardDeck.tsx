import { DeckCoffeeShop } from "@/data/french/decks/deck_a1__coffee_shop";
import DeckBox from "@/src/components/DeckBox";
import { StyleSheet, View } from "react-native";

/**
 * Add more decks here
 * TODO: Maybe barrel
 */
const decks = [DeckCoffeeShop];

/**
 * ChooseCardDeck component
 */
export default function ChooseCardDeck() {
  /**
   * Destructure styles
   */
  const {
    cardGridStyle,
  } = styles;

  /**
   * Render the card grid
   */
  return (
    <View style={cardGridStyle}>
      {decks.length > 0 && (
        decks.map(deck => <DeckBox key={deck.title} deck={deck} />)
      )}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardGridStyle: {
    display: 'flex',
    gap: 8,
  },
})
