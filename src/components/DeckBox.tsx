import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck } from "@/src/db/interface";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import colors from "../app/colors";
import sharedStyles from "../app/sharedStyles";
import { useUserContext } from "../db/useUserContext";
import type { CardDeck } from "./CardDeck/cardDeckTypes";

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
  const user = useUserContext();
  const { cardDeckDispatch } = useCardDeck();
  const {
    title,
    description,
    CEFR,
    image
  } = deck;

  const CEFRGradientLight: readonly [string, string] = [
    colors.light.CEFR[CEFR[0]],
    colors.light.CEFR[CEFR.at(-1)!],
  ];

  const CEFRGradientDark: readonly [string, string] = [
    colors.dark.CEFR[CEFR[0]],
    colors.dark.CEFR[CEFR.at(-1)!],
  ];

  /**
   * Destructure styles
   */
  const {
    cardStyle,
    cardInnerStyle,
    cardHeaderStyle,
    titleContainer,
    gradientTextContainer,
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
    if (user?.id) {
      const deck = await getDeck({
        deck: selectedDeck,
        userId: user.id
      });

      if (deck) {
        cardDeckDispatch({ type: 'SET_DECK', payload: deck });
        router.push('/CardDeck');
      }
    }
  }, [
    user?.id,
    cardDeckDispatch
  ]);

  /**
   * Render the card grid
   */
  return (
    <View style={cardStyle}>
      <View style={cardInnerStyle}>
        <View style={cardHeaderStyle}>
          <View style={titleContainer}>
            <View style={gradientTextContainer}>
              <Text style={titleStyle}>{title}</Text>
            </View>
          </View>
          <Text style={descriptionStyle}>{description}</Text>
        </View>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={CEFRGradientLight}
          style={CEFRGradientStyle}
        >
          <Text style={CEFRLabelStyle}>CEFR</Text>
          <Text style={CEFRTextStyle}>{CEFR.join(' - ')}</Text>
        </LinearGradient>
        <ImageBackground source={image} style={imageBackgroundStyle} />
        <View style={cardFooterStyle}>
          <LinkButton handler={() => handleDeckSelect(deck)}>
            <Text>Review this deck →</Text>
          </LinkButton>
        </View>
      </View >
    </View >
  );
}

/**
 * Destructure shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardStyle: {
    margin: containerMargin
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
    borderBottomWidth: 1,
    borderColor: colors.light.border
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
  },
  gradientTextContainer: {
    display: 'flex',
    flexShrink: 1,
    padding: 12,
    paddingBottom: 0,
    justifyContent: 'center'
  },
  titleStyle: {
    color: colors.dark.text,
    fontSize: 20,
    fontWeight: 800,
    wordWrap: 'wrap',
  },
  CEFRGradientStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    width: '100%',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 1,
    paddingBottom: 1,
    borderColor: colors.light.border,
  },
  CEFRLabelStyle: {
    fontSize: 14,
    fontWeight: 700,
  },
  CEFRTextStyle: {
    fontWeight: 700,
    fontSize: 14,
    color: colors.dark.text,
  },
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontWeight: 400,
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
