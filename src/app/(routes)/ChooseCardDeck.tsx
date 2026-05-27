import { DeckCoffeeShop } from "@/data/french/decks/deck_a1__coffee_shop";
import DeckBox from "@/src/components/DeckBox";
import { FlatList, StyleSheet } from "react-native";

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
    <FlatList
      contentContainerStyle={cardGridStyle}
      data={decks}
      renderItem={({ item }) => <DeckBox deck={item} />}
      keyExtractor={(deck, index) => `${deck.title}-${index}`}
    />
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
