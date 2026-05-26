import { DeckCoffeeShop } from "@/data/french/decks/deck_a1__coffee_shop";
import { CardDeck } from "@/data/french/decks/deckTyps";
import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck } from "@/src/db/interface";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

/**
 * TODO: Components
 * Pressable - need a styled button component
 * Grid - Card grid
 * Card - Need a card component with all of this...probably just that actually...idk yet.
 */
export default function ChooseCardDeck() {
  const { currentCard, cardDeckDispatch } = useCardDeck();
  const [hasDeck, setHasDeck] = useState<boolean>(false);

  const handleDeckSelect = useCallback(async (selectedDeck: CardDeck) => {
    const deck = await getDeck(selectedDeck);

    if (deck) {
      cardDeckDispatch({ type: 'SET_DECK', payload: deck });
      setHasDeck(true);
    }
  }, [cardDeckDispatch]);

  return (
    <>
      <View>
        <View>
          <Text>Coffee Shop</Text>
          <Text>POV you{'\''}re in a coffee shop!</Text>
          <Pressable onPress={() => handleDeckSelect(DeckCoffeeShop)}>
            <Text>Choose this deck</Text>
          </Pressable>
        </View>
      </View>
      {hasDeck && (
        <LinkButton
          screen="(routes)/CardDeck"
          disabled={!currentCard}
        >
          Do the deck!
        </LinkButton>
      )}
    </>
  );
}
