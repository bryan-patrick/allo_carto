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
import GradientText from "./GradientText";

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
              <GradientText
                text={title}
                fontSize={20}
                style={titleStyle}
                colors={CEFRGradientDark}
              />
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
          </View>
          <Text style={descriptionStyle}>{description}</Text>
        </View>
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
    borderWidth: 6,
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
  gradientTextContainer: {
    paddingTop: 8,
    flexShrink: 1,
    paddingLeft: 12,
    display: 'flex',
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
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingRight: 4,
    paddingLeft: 4,
    borderWidth: 1,
    marginLeft: 4,
    borderRadius: 8,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    borderColor: colors.dark.border,
  },
  CEFRLabelStyle: {
    fontSize: 10,
    paddingLeft: 8,
    paddingTop: 2,
    fontWeight: 800,
  },
  CEFRTextStyle: {
    fontWeight: 600,
    fontSize: 14,
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
