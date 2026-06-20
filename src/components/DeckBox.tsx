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
interface SelectCardDeckProps {
  deck: CardDeck;
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck }: SelectCardDeckProps) {
  const user = useUserContext();
  const { cardDeckDispatch } = useCardDeck();
  const {
    title,
    description,
    CEFR,
    image,
    colors: deckColors
  } = deck;

  const CEFRGradientLight: readonly [string, string] = [
    colors.light.CEFR[CEFR[0]],
    colors.light.CEFR[CEFR.at(-1)!],
  ];

  /**
   * Destructure styles
   */
  const {
    cardStyle,
    cardInnerStyle,
    cardBorderInnerStyle,
    cardHeaderStyle,
    titleContainer,
    gradientTextContainer,
    titleStyle,
    CEFRGradientStyle,
    CEFRLabelStyle,
    CEFRTextStyle,
    descriptionStyle,
    imageContainerStyle,
    imageStyle,
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
        <View style={cardBorderInnerStyle}>
          <View style={cardHeaderStyle}>
            <View style={titleContainer}>
              <View style={gradientTextContainer}>
                {deckColors?.dark && deckColors.light && (
                  <GradientText
                    fontSize={20}
                    fontWeight={800}
                    colors={[deckColors.dark, deckColors.light]}
                    text={title}
                  />
                )}
                {!deckColors?.dark && !deckColors?.light && (
                  <Text style={titleStyle}>{title}</Text>
                )}
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
          <View style={imageContainerStyle}>
            <ImageBackground source={image} style={imageStyle} />
          </View>
          <View style={cardFooterStyle}>
            <LinkButton
              handler={() => handleDeckSelect(deck)}
              deckColors={deckColors}
            >
              <Text>Review this deck →</Text>
            </LinkButton>
          </View>
        </View>
      </View>
    </View>
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
    margin: containerMargin,
    paddingBottom: 8,
  },
  cardInnerStyle: {
    backgroundColor: colors.light.background,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: colors.light.border,
    boxShadow: `0 20px 0 ${colors.dark.border}`,
  },
  cardBorderInnerStyle: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark.border
  },
  cardHeaderStyle: {
    display: 'flex',
    borderBottomWidth: 1,
    borderRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderColor: colors.light.border,
  },
  titleContainer: {
  },
  gradientTextContainer: {
    display: 'flex',
    flexShrink: 1,
    padding: 16,
    paddingBottom: 0,
    justifyContent: 'center',
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
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 1,
    paddingBottom: 1,
    borderColor: colors.dark.border,
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
    fontWeight: 500,
    padding: 16,
    paddingTop: 8,
  },
  imageContainerStyle: {
    borderColor: colors.dark.border,
    borderWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
  },
  imageStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: 200,
  },
  cardFooterStyle: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: colors.light.border
  },
})
