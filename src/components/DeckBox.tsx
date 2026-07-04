import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import LinkButton from "@/src/components/LinkButton";
import { getDeck, getWordRanksById } from "@/src/db/interface";
import getDeckRankCounts, {
  DeckRankCounts,
  emptyDeckRankCounts,
} from "@/src/db/queries/getDeckRankCounts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from "../app/colors";
import sharedStyles from "../app/sharedStyles";
import { useUserContext } from "../db/useUserContext";
import type { WordRankKey } from "../util/wordRanks";
import type { CardDeck } from "./CardDeck/cardDeckTypes";
import DeckBoxModal from "./DeckBoxModal";
import GradientText from "./GradientText";
import SVGArrowUpFromLine from "./SVG/SVGArrowUpFromLine";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const plopStyleByRank: Record<WordRankKey, ViewStyle> = {
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
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck }: SelectCardDeckProps) {
  const user = useUserContext();
  const { cardDeckDispatch } = useCardDeck();
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);
  const [wordRankKeyByWordId, setWordRankKeyByWordId] = useState<Record<string, WordRankKey>>({});
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Deck vars
   */
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
    buttonOpen,
    buttonOpenContent,
    buttonOpenText,
    storyProgressStyle,
    storyProgressTextStyle,
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

  const loadStoryWordRanks = useCallback(async () => {
    try {
      if (user?.id) {
        const storyWordRankKeyByWordId = await getWordRanksById({
          userId: user.id,
          story: deck.story,
        });

        setWordRankKeyByWordId(storyWordRankKeyByWordId);
        return;
      }

      setWordRankKeyByWordId({});

    } catch (error) {
      console.error('Could not retrieve story word ranks:', error);
    }
  }, [user?.id, deck.story]);

  /**
   * Load initial deck progress data
   */
  useEffect(() => {
    let isCurrent = true;

    async function loadInitialRankCounts() {
      if (isCurrent) await loadRankCounts();
    }

    loadInitialRankCounts();

    return () => {
      isCurrent = false;
    };
  }, [loadRankCounts]);

  /**
   * Load initial story rank data
   */
  useEffect(() => {
    let isCurrent = true;

    async function loadInitialStoryWordRanks() {
      if (isCurrent) await loadStoryWordRanks();
    }

    loadInitialStoryWordRanks();

    return () => {
      isCurrent = false;
    };
  }, [loadStoryWordRanks]);

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
   * Animation vars
   */
  const storyButtonTranslateY = useSharedValue(0);
  const storyButtonIconTranslateY = useSharedValue(0);

  const animatedStoryButtonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: storyButtonTranslateY.value,
      },
    ],
  }));

  const animatedStoryButtonIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: storyButtonIconTranslateY.value,
      },
    ],
  }));

  /**
   * StoryButton press animation handlers
   */
  function handleStoryPressIn() {
    storyButtonTranslateY.value = withTiming(-6, {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
    storyButtonIconTranslateY.value = withTiming(-4, {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
  }

  function handleStoryPressOut() {
    storyButtonTranslateY.value = withTiming(0, {
      duration: 140,
      easing: Easing.out(Easing.ease),
    });
    storyButtonIconTranslateY.value = withTiming(0, {
      duration: 140,
      easing: Easing.out(Easing.ease),
    });
  }

  /**
   * Refresh story data and show modal
   */
  async function handleShowStory() {
    await Promise.all([
      loadRankCounts(),
      loadStoryWordRanks(),
    ]);

    setModalVisible(true);
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
              wordRankKeyByWordId={wordRankKeyByWordId}
            />
            <AnimatedPressable
              style={[buttonOpen, animatedStoryButtonStyle, {
                borderColor: deckColors?.dark,
              }]}
              onPressIn={handleStoryPressIn}
              onPressOut={handleStoryPressOut}
              onPress={handleShowStory}
              hitSlop={4}
            >
              <View style={buttonOpenContent}>
                <Text style={[buttonOpenText, { color: deckColors?.dark }]}>Show Story</Text>
                <Animated.View style={animatedStoryButtonIconStyle}>
                  <SVGArrowUpFromLine
                    color={deckColors?.dark}
                    height="20px"
                    width="20px"
                  />
                </Animated.View>
              </View>
            </AnimatedPressable>
            {
              /**
               * Story Progress
               */
            }
            <View style={storyProgressStyle}>
              <Text style={[storyProgressTextStyle, { color: deckColors?.dark }]}>
                {deckCompletionPercent}%
              </Text>
              <View style={plopContainerStyle}>
                {deck.story?.map(({ wordId, text }, index) => {
                  const rank = wordRankKeyByWordId[wordId ?? ''] ?? 'fnew';

                  return (
                    <View
                      key={`plop-${index}-${wordId}-${text}`}
                      style={[plopStyle, plopStyleByRank[rank]]}
                    />
                  )
                })}
              </View>
            </View>
          </View>
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
          </View>
          {
            /**
             * Review Link
             */
          }
          <View style={cardFooterStyle}>
            <LinkButton
              handler={() => handleDeckSelect(deck)}
              deckColors={deckColors}
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
    borderWidth: 6,
    marginRight: 8,
    marginLeft: 8,
    padding: 4,
    borderColor: colors.light.border,
    boxShadow: `0 20px 0 ${colors.dark.border}`,
  },
  cardBorderInnerStyle: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.light.border,
  },
  cardHeaderStyle: {
    position: 'relative',
    display: 'flex',
    borderBottomWidth: 1,
    borderRadius: 8,
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
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontFamily: 'lexend-400',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 12,
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
  buttonOpen: {
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    backgroundColor: colors.light.lighterBackground,
    borderColor: colors.dark.border,
    shadowColor: colors.light.border,
  },
  buttonOpenContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonOpenText: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    textAlign: 'center',
    fontSize: 16,
  },
  storyProgressStyle: {
    alignItems: 'center',
    borderColor: colors.light.border,
    backgroundColor: colors.light.lighterBackground,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 4,
    gap: 8,
  },
  storyProgressTextStyle: {
    fontFamily: 'azeret-mono-600',
    fontSize: 14,
  },
  plopContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  plopStyle: {
    width: 6,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
})
