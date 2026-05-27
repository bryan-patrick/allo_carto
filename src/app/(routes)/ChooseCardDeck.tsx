import { DeckCoffeeShop } from "@/data/french/decks/deck_a1__coffee_shop";
import { CardDeck } from "@/data/french/decks/deckTyps";
import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck } from "@/src/db/interface";
import { router } from 'expo-router';
import { useCallback, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { colors } from "../styles";

const coffeeShopImage = require("../assets/images/decks/coffeeshop.jpg");

/**
 * ChooseCardDeck component
 */
export default function ChooseCardDeck() {
  const { cardDeckDispatch } = useCardDeck();
  const [hasDeck, setHasDeck] = useState<boolean>(false);

  /**
   * Destructure styles
   */
  const {
    cardGrid,
    card,
    imageBackground,
    textContainer,
    title,
    description,
    selectButton,
    selectButtonText,
    cardInner
  } = styles;

  /**
   * Handlers
   */
  const handleDeckSelect = useCallback(async (selectedDeck: CardDeck) => {
    const deck = await getDeck(selectedDeck);

    if (deck) {
      cardDeckDispatch({ type: 'SET_DECK', payload: deck });
      setHasDeck(true);
      router.push('/CardDeck');
    }
  }, [cardDeckDispatch]);

  /**
   * Render the card grid
   */
  return (
    <View style={cardGrid}>
      <View style={card}>
        <View style={cardInner}>
          <ImageBackground source={coffeeShopImage} style={imageBackground} />
          <View style={textContainer}>
            <Text style={title}>Coffee Shop</Text>
            <Text style={description}>POV you{'\''}re in a coffee shop!</Text>
            <LinkButton
              handler={() => handleDeckSelect(DeckCoffeeShop)}
              style={selectButton}
            >
              <Text style={selectButtonText}>Review →</Text>
            </LinkButton>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardGrid: {
    display: 'flex',
    gap: 8,
  },
  card: {
    margin: 8
  },
  cardInner: {
    overflow: 'hidden',
    borderRadius: 8,
    borderColor: colors.light.background,
    boxShadow: `0 8px 0 0 ${colors.dark.border}`
  },
  imageBackground: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: 180
  },
  textContainer: {
    backgroundColor: colors.light.background,
    paddingRight: 8,
    paddingLeft: 8,
    padding: 16,
    gap: 8,
    display: 'flex',
  },
  title: {
    color: colors.dark.text,
    fontSize: 20,
    fontWeight: 800,
  },
  description: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontWeight: 600
  },
  selectButton: {
    margin: 8
  },
  selectButtonText: {
  }
})