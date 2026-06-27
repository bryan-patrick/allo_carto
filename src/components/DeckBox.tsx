import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck } from "@/src/db/interface";
import getDeckRankCounts, {
  DeckRankCounts,
  emptyDeckRankCounts,
} from "@/src/db/queries/getDeckRankCounts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import colors from "../app/colors";
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
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);
  const {
    title,
    description,
    CEFR,
    image,
    colors: deckColors
  } = deck;
  const badgeIconSize = 16;
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
    badgeContainerStyle,
    badgeCountContainerStyle,
    badgeCountTextStyle,
    cardFooterStyle,
  } = styles;

  useEffect(() => {
    let isCurrent = true;

    async function loadRankCounts() {
      if (!user?.id) {
        setRankCounts(emptyDeckRankCounts);
        return;
      }

      const counts = await getDeckRankCounts({
        userId: user.id,
        wordIds: deck.wordIds,
      });

      if (isCurrent) setRankCounts(counts);
    }

    loadRankCounts().catch(error => {
      console.error('Could not retrieve deck rank counts:', error);
    });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, deck.wordIds]);

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
                    fontWeight={700}
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
          <View style={[badgeContainerStyle, { backgroundColor: deckColors?.light ?? colors.dark.primary }]}>
            <View style={badgeCountContainerStyle}>
              <Text style={badgeCountTextStyle}>{rankCounts.fnew}</Text>
              <MaterialIcons color={colors.light.text} size={badgeIconSize} name="fiber-new" />
            </View>
            <View style={badgeCountContainerStyle}>
              <Text style={badgeCountTextStyle}>{rankCounts.bronze}</Text>
              <MaterialIcons color={colors.light.text} size={badgeIconSize} name="stars" />
            </View>
            <View style={badgeCountContainerStyle}>
              <Text style={badgeCountTextStyle}>{rankCounts.silver}</Text>
              <MaterialIcons color={colors.light.text} size={badgeIconSize} name="military-tech" />
            </View>
            <View style={badgeCountContainerStyle}>
              <Text style={badgeCountTextStyle}>{rankCounts.gold}</Text>
              <MaterialIcons color={colors.light.text} size={badgeIconSize} name="emoji-events" />
            </View>
            <View style={badgeCountContainerStyle}>
              <Text style={badgeCountTextStyle}>{rankCounts.diamond}</Text>
              <MaterialIcons color={colors.light.text} size={badgeIconSize} name="diamond" />
            </View>
            <View style={badgeCountContainerStyle}>
              <Text style={badgeCountTextStyle}>{rankCounts.memorized}</Text>
              <MaterialIcons color={colors.light.text} size={16} name="psychology" />
            </View>
          </View>
          <View style={cardFooterStyle}>
            <LinkButton
              handler={() => handleDeckSelect(deck)}
              deckColors={deckColors}
            >
              Review this deck
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
  cardStyle: {
    margin: 32,
  },
  cardInnerStyle: {
    backgroundColor: colors.light.background,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 4,
    marginRight: 8,
    marginLeft: 8,
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
    fontFamily: 'lexend-700',
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
    paddingTop: 2,
    paddingBottom: 2,
    borderColor: colors.dark.border,
  },
  CEFRLabelStyle: {
    fontSize: 14,
    fontFamily: 'lexend-400',
  },
  CEFRTextStyle: {
    fontFamily: 'lexend-400',
    fontSize: 14,
    color: colors.dark.text,
  },
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontFamily: 'lexend-400',
    padding: 16,
    paddingTop: 8,
  },
  imageContainerStyle: {
  },
  imageStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: 160,
  },
  badgeContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: colors.dark.border
  },
  badgeCountContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  badgeCountTextStyle: {
    fontFamily: 'azeret-mono-600',
    color: colors.light.text,
    fontSize: 12,
  },
  cardFooterStyle: {
    padding: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
})
