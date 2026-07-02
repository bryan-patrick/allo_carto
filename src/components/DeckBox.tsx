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
import { Alert, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../app/colors";
import sharedStyles from "../app/sharedStyles";
import { useUserContext } from "../db/useUserContext";
import type { WordRankKey } from "../util/wordRanks";
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
    centeredView,
    modalView,
    modalTitleStyle,
    modalTextContentStyle,
    modalText,
    buttonOpen,
    buttonOpenText,
    buttonClose,
    buttonCloseText,
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
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalVisible(!modalVisible);
              }}>
              <View style={centeredView}>
                <View style={modalView}>
                  <View style={modalTitleStyle}>
                    <GradientText
                      colors={[deck.colors?.dark ?? '', deck.colors?.light ?? '']}
                      fontSize={18}
                      fontWeight={700}
                      text={deck.title}
                    />
                  </View>
                  {
                    /**
                     * Modal Content
                     */
                  }
                  <Text style={modalTextContentStyle}>
                    {deck.story && deck.story.map(({ text, wordId, after }, index) => {
                      const key = `${index}-${wordId ?? text}`;
                      const spaceMaybeButNotAlways = after ?? ' ';
                      let rank = wordRankKeyByWordId[wordId ?? '']

                      const wordStyle: any = {
                        fontSize: 14,
                        fontWeight: '400',
                        color: colors.light.rank[rank],
                      }

                      switch (rank) {
                        case "fnew":
                          wordStyle.color = colors.light.rank.fnew;
                          break;
                        case "bronze":
                          wordStyle.fontSize = 18;
                          wordStyle.fontWeight = '500';
                          break;
                        case "silver":
                          wordStyle.fontSize = 20;
                          wordStyle.fontWeight = '500';
                          break;
                        case "gold":
                          wordStyle.fontSize = 22;
                          wordStyle.fontWeight = '700';
                          break;
                        case "diamond":
                          wordStyle.fontSize = 24;
                          wordStyle.fontWeight = '800';
                          break;
                      }

                      return (
                        <Text
                          key={key}
                          style={[modalText, wordStyle]}>{text + spaceMaybeButNotAlways}{spaceMaybeButNotAlways}
                        </Text>
                      )
                    })}
                  </Text>
                  {
                    /**
                     * Modal Close Button
                     */
                  }
                  <Pressable
                    style={buttonClose}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={buttonCloseText}>Hide Story</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            <Pressable
              style={buttonOpen}
              onPress={() => setModalVisible(true)}>
              <Text style={buttonOpenText}>Show Story</Text>
            </Pressable>
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
    borderWidth: 6,
    marginRight: 8,
    marginLeft: 8,
    padding: 6,
    borderColor: colors.light.border,
    boxShadow: `0 20px 0 ${colors.dark.border}`,
  },
  cardBorderInnerStyle: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
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
  descriptionStyle: {
    color: colors.dark.text,
    wordWrap: 'wrap',
    fontSize: 16,
    fontFamily: 'lexend-400',
    padding: 16,
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
  // Modal styles
  centeredView: {
    margin: containerMargin,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    position: 'relative',
    margin: containerMargin,
    backgroundColor: colors.dark.background,
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.dark.border,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    gap: 8,
  },
  modalTextContentStyle: {
    padding: 4
  },
  modalTitleStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    padding: 8,
    width: '100%',
  },
  modalText: {
    textAlign: 'center',
    color: 'transparent',
  },
  buttonOpen: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderColor: colors.dark.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
    padding: 8,
  },
  buttonOpenText: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonClose: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: colors.light.border,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 10,
    width: '100%'
  },
  buttonCloseText: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    textAlign: 'center',
    fontSize: 16,
  },
})
