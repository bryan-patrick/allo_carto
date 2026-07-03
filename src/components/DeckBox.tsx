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
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
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
  } = styles;


  useEffect(() => {
    let isCurrent = true;

    async function loadRankCounts() {
      try {
        if (!user?.id) {
          setRankCounts(emptyDeckRankCounts);
          return;
        }

        const counts = await getDeckRankCounts({
          userId: user.id,
          wordIds: deck.wordIds,
        });

        if (isCurrent) setRankCounts(counts);

      } catch (error) {
        console.error('Could not retrieve deck rank counts:', error);
      }
    }

    loadRankCounts();

    return () => {
      isCurrent = false;
    };
  }, [user?.id, deck.wordIds]);

  useEffect(() => {
    let isCurrent = true;

    async function loadStoryWordRanks() {
      try {
        if (user?.id) {
          const storyWordRankKeyByWordId = await getWordRanksById({
            userId: user.id,
            story: deck.story,
          });

          if (isCurrent) setWordRankKeyByWordId(storyWordRankKeyByWordId);
        }

        if (!user?.id && isCurrent) {
          setWordRankKeyByWordId({});
        }

      } catch (error) {
        console.error('Could not retrieve story word ranks:', error);
      }
    }

    loadStoryWordRanks();

    return () => {
      isCurrent = false;
    };
  }, [user?.id, deck.story]);

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
   * Side effects
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
              onPress={() => setModalVisible(true)}
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
    padding: 4,
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
})
