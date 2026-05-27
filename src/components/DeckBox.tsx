import { CardDeck } from "@/data/french/decks/deckTyps";
import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck } from "@/src/db/interface";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback } from "react";
import { ColorValue, ImageBackground, StyleSheet, Text, View } from "react-native";
import { colors } from "../app/styles";

/**
 * Image src
 */
const coffeeItems = require("@/src/app/assets/images/decks/coffee-items.jpg");

/**
 * Typing
 */
interface ChooseCardDeckProps {
  deck: CardDeck;
}

/**
 * ChooseCardDeck component
 */
export default function DeckBox({ deck }: ChooseCardDeckProps) {
  const { cardDeckDispatch } = useCardDeck();
  const {
    title,
    description,
    CEFR,
  } = deck;

  const CEFRGradient: readonly [ColorValue, ColorValue] = [
    colors.light.CEFR[CEFR[0]],
    colors.light.CEFR[CEFR.at(-1)!],
  ];

  /**
   * Destructure styles
   */
  const {
    cardStyle,
    cardInnerStyle,
    cardHeaderStyle,
    titleContainer,
    titleStyle,
    CEFRGradientStyle,
    CEFRLabelStyle,
    CEFRTextStyle,
    descriptionStyle,
    imageBackgroundStyle,
    cardFooterStyle,
  } = styles;

  /**
   * Handlers
   */
  const handleDeckSelect = useCallback(async (selectedDeck: CardDeck) => {
    const deck = await getDeck(selectedDeck);

    if (deck) {
      cardDeckDispatch({ type: 'SET_DECK', payload: deck });
      router.push('/CardDeck');
    }
  }, [cardDeckDispatch]);

  /**
   * Render the card grid
   */
  return (
    <View style={cardStyle}>
      <View style={cardInnerStyle}>
        <View style={cardHeaderStyle}>
          <View style={titleContainer}>
            <Text style={titleStyle}>{title}</Text>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={CEFRGradient}
              style={CEFRGradientStyle}
            >
              <Text style={CEFRLabelStyle}>CEFR</Text>
              <Text style={CEFRTextStyle}>{CEFR.join(' - ')}</Text>
            </LinearGradient>
          </View>
          <Text style={descriptionStyle}>{description}</Text>
        </View>
        <ImageBackground source={coffeeItems} style={imageBackgroundStyle} />
        <View style={cardFooterStyle}>
          <LinkButton handler={() => handleDeckSelect(deck)}>
            <Text>Review this deck →</Text>
          </LinkButton>
        </View>
      </View>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardStyle: {
    margin: 32
  },
  cardInnerStyle: {
    backgroundColor: colors.light.background,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.light.border,
    boxShadow: `0 16px 0 ${colors.dark.border}`
  },
  cardHeaderStyle: {
    display: 'flex',
    borderBottomWidth: 2,
    borderColor: colors.light.border
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
  },
  titleStyle: {
    color: colors.dark.text,
    fontSize: 20,
    fontWeight: 800,
    paddingLeft: 12,
    wordWrap: 'wrap',
    flexShrink: 1,
    paddingTop: 8,
  },
  CEFRGradientStyle: {
    overflow: 'hidden',
    alignSelf: 'flex-start',
    paddingLeft: 4,
    paddingRight: 4,
    flexShrink: 1,
    borderBottomLeftRadius: 8,
    borderRadius: 8,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: colors.dark.border,
    borderWidth: 1,
  },
  CEFRLabelStyle: {
    fontSize: 10,
    paddingLeft: 8,
    paddingTop: 2,
    fontWeight: 800,
  },
  CEFRTextStyle: {
    fontWeight: 600,
    fontSize: 16,
    color: colors.dark.text,
    paddingTop: 0,
    paddingLeft: 8,
    paddingRight: 8,
    padding: 4,
  },
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontWeight: 600,
    padding: 12,
    paddingTop: 8
  },
  imageBackgroundStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: 200,
  },
  cardFooterStyle: {
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderColor: colors.light.border
  },
})
