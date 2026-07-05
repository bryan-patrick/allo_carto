import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck, getWordProgressById } from "@/src/db/interface";
import getDeckRankCounts, {
  DeckRankCounts,
  emptyDeckRankCounts,
} from "@/src/db/queries/getDeckRankCounts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { ImageBackground, StyleSheet, Text, View, type ViewStyle } from "react-native";
import colors from "../app/colors";
import sharedStyles from "../app/sharedStyles";
import { useUserContext } from "../db/useUserContext";
import type { WordProgressKey } from "../util/wordRanks";
import type { CardDeck } from "./CardDeck/cardDeckTypes";
import DeckBoxModal from "./DeckBoxModal";
import GradientText from "./GradientText";
import SecondaryButton from "./SecondaryButton";
import SVGArrowUpFromLine from "./SVG/SVGArrowUpFromLine";
import SVGRightArrow from "./SVG/SVGRightArrow";

const plopStyleByProgress: Record<WordProgressKey, ViewStyle> = {
  unseen: {
    backgroundColor: 'transparent',
    borderColor: colors.dark.border,
    opacity: 0.35,
  },
  fnew: {
    backgroundColor: colors.light.rank.fnew,
    borderColor: colors.dark.rank.fnew,
    opacity: 0.2,
  },
  bronze: {
    backgroundColor: colors.light.rank.bronze,
    borderColor: colors.dark.rank.bronze,
    opacity: 0.75,
  },
  silver: {
    backgroundColor: colors.light.rank.silver,
    borderColor: colors.dark.rank.silver,
    opacity: 0.85,
  },
  gold: {
    backgroundColor: colors.light.rank.gold,
    borderColor: colors.dark.rank.gold,
    opacity: 0.95,
  },
  diamond: {
    backgroundColor: colors.light.rank.diamond,
    borderColor: colors.dark.rank.diamond,
    opacity: 1,
  },
};

/**
 * Typing
 */
interface SelectCardDeckProps {
  deck: CardDeck;
  placeId?: string;
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck, placeId }: SelectCardDeckProps) {
  const user = useUserContext();
  const { cardDeckDispatch } = useCardDeck();
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);
  const [wordProgressKeyByWordId, setWordProgressKeyByWordId] = useState<Record<string, WordProgressKey>>({});
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Deck vars
   */
  const {
    title,
    description,
    CEFR,
    image
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
    descriptionStyle,
    CEFRGradientStyle,
    CEFRLabelStyle,
    CEFRTextStyle,
    imageContainerStyle,
    imageStyle,
    badgeContainerStyle,
    badgeCountContainerStyle,
    badgeCountTextStyle,
    cardFooterStyle,
    storyProgressContainerStyle,
    storyProgressHeaderStyle,
    storyProgressTitleStyle,
    storyProgressStyle,
    storyProgressTextStyle,
    storyProgressButtonContainerStyle,
    storyProgressButtonStyle,
    storyProgressButtonTextStyle,
    plopContainerStyle,
    plopStyle,
  } = styles;

  /**
   * Deck completion
   */
  const deckCompletionTotal = deck.wordIds.length * 4;
  const deckCompletionCount = rankCounts.bronze + (rankCounts.silver * 2) + (rankCounts.gold * 3) + (rankCounts.diamond * 4);
  const deckCompletionPercent = deckCompletionTotal === 0
    ? 0
    : Math.round((deckCompletionCount / deckCompletionTotal) * 100);

  /**
   * Data loaders
   */
  const loadRankCounts = useCallback(async () => {
    try {
      if (!user?.id) {
        setRankCounts(emptyDeckRankCounts);
        return;
      }

      const counts = await getDeckRankCounts({
        userId: user.id,
        wordIds: deck.wordIds,
      });

      setRankCounts(counts);

    } catch (error) {
      console.error('Could not retrieve deck rank counts:', error);
    }
  }, [user?.id, deck.wordIds]);

  const loadStoryWordProgress = useCallback(async () => {
    try {
      if (user?.id) {
        const storyWordProgressKeyByWordId = await getWordProgressById({
          userId: user.id,
          story: deck.story,
        });

        setWordProgressKeyByWordId(storyWordProgressKeyByWordId);
        return;
      }

      setWordProgressKeyByWordId({});

    } catch (error) {
      console.error('Could not retrieve story word progress:', error);
    }
  }, [user?.id, deck.story]);

  /**
   * Refresh deck progress data when the deck list is focused.
   * This keeps the story blips updated after reviewing a deck
   * and returning to the deck box.
   */
  useFocusEffect(
    useCallback(() => {
      loadRankCounts();
      loadStoryWordProgress();
    }, [
      loadRankCounts,
      loadStoryWordProgress,
    ])
  );

  /**
   * ReviewDeck handler
   */
  const handleDeckSelect = useCallback(async (selectedDeck: CardDeck) => {
    if (user?.id) {
      const deck = await getDeck({
        deck: selectedDeck,
        userId: user.id
      });

      if (deck) {
        cardDeckDispatch({ type: 'SET_DECK', payload: deck });
        router.push('/CardDeckRankSelect');
      }
    }
  }, [
    user?.id,
    cardDeckDispatch
  ]);

  /**
   * Refresh story data and show modal
   */
  async function handleShowStory() {
    await Promise.all([
      loadRankCounts(),
      loadStoryWordProgress(),
    ]);

    setModalVisible(true);
  }

  /**
   * Open the full card list for this deck.
   */
  function handleViewCards() {
    router.push({
      pathname: '/ViewCards',
      params: {
        deckTitle: deck.title,
        placeId,
      },
    });
  }

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
                <GradientText
                  fontSize={20}
                  fontWeight={700}
                  colors={[
                    deck.colors.dark.primary,
                    deck.colors.dark.secondary
                  ]}
                  text={title}
                />
              </View>
            </View>
            <Text style={descriptionStyle}>{description}</Text>
            {
              /**
               * CEFR Bar
               */
            }
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={CEFRGradientLight}
              style={CEFRGradientStyle}
            >
              <Text style={CEFRLabelStyle}>CEFR</Text>
              <Text style={CEFRTextStyle}>{CEFR.join(' - ')}</Text>
            </LinearGradient>
            {
              /**
               * Deck Image
               */
            }
            <View style={imageContainerStyle}>
              <ImageBackground source={image} style={imageStyle} />
            </View>
            {
              /**
               * Rank Counts
               */
            }
            <View style={[badgeContainerStyle, { backgroundColor: deck.colors.dark.secondary }]}>
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
            </View>
            {
              /**
               * Modal
               */
            }
            <DeckBoxModal
              deck={deck}
              modalVisible={modalVisible}
              rankCounts={rankCounts}
              setModalVisible={setModalVisible}
              wordProgressKeyByWordId={wordProgressKeyByWordId}
            />
            <View style={[storyProgressContainerStyle]}>
              <View style={[storyProgressHeaderStyle, { borderColor: deck.colors.dark.primary }]}>
                <Text style={[storyProgressTitleStyle, { color: deck.colors.dark.primary }]}>Story Progress</Text>
                <Text style={[storyProgressTextStyle, { color: deck.colors.dark.primary }]}>
                  {deckCompletionPercent}%
                </Text>
              </View>
              {
                /**
                 * Story Progress
                 */
              }
              <View style={storyProgressStyle}>
                <View style={plopContainerStyle}>
                  {deck.story?.map(({ wordId, text }, index) => {
                    const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';

                    return (
                      <View
                        key={`plop-${index}-${wordId}-${text}`}
                        style={[plopStyle, plopStyleByProgress[progress]]}
                      />
                    )
                  })}
                </View>
              </View>
              <View style={storyProgressButtonContainerStyle}>
                <SecondaryButton
                  style={[storyProgressButtonStyle, {
                    backgroundColor: deck.colors.dark.secondary,
                    borderColor: deck.colors.dark.primary,
                    shadowColor: deck.colors.dark.primary,
                  }]}
                  textStyle={storyProgressButtonTextStyle}
                  onPress={handleShowStory}
                  hitSlop={4}
                  SVGElement={
                    <SVGArrowUpFromLine
                      color={colors.light.text}
                      height="14px"
                      width="14px"
                    />
                  }
                >
                  Show Story
                </SecondaryButton>
                <SecondaryButton
                  style={[storyProgressButtonStyle, {
                    backgroundColor: deck.colors.dark.secondary,
                    borderColor: deck.colors.dark.primary,
                    shadowColor: deck.colors.dark.primary,
                  }]}
                  textStyle={storyProgressButtonTextStyle}
                  onPress={handleViewCards}
                  hitSlop={4}
                  SVGElement={
                    <SVGRightArrow
                      height="14px"
                      width="14px"
                      color={colors.light.text}
                    />
                  }
                >
                  View Cards
                </SecondaryButton>
              </View>
            </View>
          </View>
          {
            /**
             * Review Link
             */
          }
          <View style={cardFooterStyle}>
            <LinkButton
              handler={() => handleDeckSelect(deck)}
              deckColors={deck.colors}
            >
              Review this deck
            </LinkButton>
          </View>
        </View>
      </View >
    </View >
  );
}

/**
 * Destructure shared styles
 */
const { containerMargin } = sharedStyles

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardStyle: {
    margin: containerMargin,
  },
  cardInnerStyle: {
    backgroundColor: colors.light.background,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 8,
    padding: 4,
    borderColor: colors.light.border,
    boxShadow: `0 20px 0 ${colors.dark.border}`,
  },
  cardBorderInnerStyle: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardHeaderStyle: {
    position: 'relative',
    display: 'flex',
    borderBottomWidth: 1,
    borderColor: colors.dark.border,
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
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontFamily: 'lexend-400',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
    paddingTop: 8,
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
    borderTopWidth: 1,
    borderBottomWidth: 1
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
  imageContainerStyle: {
  },
  imageStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: 140,
  },
  badgeContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 4,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border
  },
  badgeCountContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  storyProgressContainerStyle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  storyProgressHeaderStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  storyProgressTitleStyle: {
    fontSize: 16,
    fontFamily: 'lexend-600'
  },
  storyProgressStyle: {
    alignItems: 'center',
    borderColor: colors.dark.border,
    flexDirection: 'row',
  },
  storyProgressTextStyle: {
    fontFamily: 'lexend-600',
    fontSize: 16,
  },
  storyProgressButtonContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  storyProgressButtonStyle: {
    flexGrow: 1
  },
  storyProgressButtonTextStyle: {
    fontSize: 12,
  },
  plopContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  plopStyle: {
    width: 10,
    height: 5,
    borderWidth: 1,
  },
})
