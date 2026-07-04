import GradientText from "@/src/components/GradientText";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from "../app/colors";
import sharedStyles from "../app/sharedStyles";
import type { DeckRankCounts } from "../db/queries/getDeckRankCounts";
import type { WordRankKey } from "../util/wordRanks";
import type { CardDeck } from "./CardDeck/cardDeckTypes";
import SVGArrowDownToLine from "./SVG/SVGArrowDownToLine";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Typing
 */
interface DeckBoxModalProps {
  deck: CardDeck;
  modalVisible: boolean;
  rankCounts: DeckRankCounts;
  setModalVisible: (modalVisible: boolean) => void;
  wordRankKeyByWordId: Record<string, WordRankKey>;
}

/**
 * DeckBoxModal component
 */
export default function DeckBoxModal({
  deck,
  modalVisible,
  rankCounts,
  setModalVisible,
  wordRankKeyByWordId,
}: DeckBoxModalProps) {

  /**
   * Destructure styles
   */
  const {
    centeredView,
    modalView,
    modalTitleStyle,
    modalHeaderStyle,
    modalHeaderTextStyle,
    modalHeaderMonospaceTextStyle,
    modalScrollView,
    modalTextContentStyle,
    modalText,
    buttonCloseContainer,
    buttonClose,
    buttonCloseContent,
    buttonCloseText,
  } = styles;

  /**
   * State/prop vars
   */
  const [isPressed, setIsPressed] = useState(false);

  /**
   * Header deck completion percentage 
   */
  const wordsSeenCount = rankCounts.bronze + rankCounts.silver + rankCounts.gold + rankCounts.diamond;
  const deckCompletionTotal = deck.wordIds.length * 4;
  const deckCompletionCount = rankCounts.bronze + (rankCounts.silver * 2) + (rankCounts.gold * 3) + (rankCounts.diamond * 4);
  const deckCompletionPercent = deckCompletionTotal === 0
    ? 0
    : Math.round((deckCompletionCount / deckCompletionTotal) * 100);
  const deckDarkColor = deck.colors?.dark ?? colors.dark.background;

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const iconTranslateY = useSharedValue(0);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: top.value,
      },
    ],
  }));

  const animatedButtonIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: iconTranslateY.value,
      },
    ],
  }));

  /**
   * Handle animations on pressed
   */
  useEffect(() => {
    if (isPressed) {
      top.value = withTiming(6, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      });
      iconTranslateY.value = withTiming(4, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      top.value = withTiming(0, {
        duration: 140,
        easing: Easing.out(Easing.ease),
      });
      iconTranslateY.value = withTiming(0, {
        duration: 140,
        easing: Easing.out(Easing.ease),
      });
    }

  }, [iconTranslateY, isPressed, top])

  /**
   * Side effects
   */
  function handlePressIn() {
    setIsPressed(true);
  }

  function handlePressOut() {
    setIsPressed(false);
  }

  /**
   * Render the modal
   */
  return (
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
          <View style={modalHeaderStyle}>
            <Text style={modalHeaderTextStyle}>
              Deck Completion: <Text style={modalHeaderMonospaceTextStyle}>{deckCompletionPercent}%</Text>
            </Text>
            <Text style={modalHeaderTextStyle}>
              Words Seen: <Text style={modalHeaderMonospaceTextStyle}>{wordsSeenCount}/{deck.wordIds.length}</Text>
            </Text>
          </View>
          {
            /**
             * Modal Content
             */
          }
          <ScrollView
            style={modalScrollView}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            indicatorStyle={"white"}
          >
            <Text style={modalTextContentStyle}>
              {deck.story && deck.story.map(({ text, wordId, after }, index) => {
                const key = `${index}-${wordId ?? text}`;
                const spaceMaybeButNotAlways = after ?? ' ';
                let rank = wordRankKeyByWordId[wordId ?? '']

                const wordStyle: any = {
                  fontSize: 16,
                  color: colors.light.rank[rank],
                  textShadowColor: colors.light.rank[rank],
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 0,
                  fontFamily: 'lexend-400',
                  lineHeight: 24
                }

                switch (rank) {
                  case "fnew":
                    wordStyle.opacity = 0.05;
                    break;
                  case "bronze":
                    wordStyle.opacity = 0.6;
                    break;
                  case "silver":
                    wordStyle.opacity = 1;
                    break;
                  case "gold":
                    wordStyle.opacity = 1;
                    wordStyle.textShadowRadius = 8;
                    break;
                  case "diamond":
                    wordStyle.opacity = 1;
                    wordStyle.textShadowRadius = 16;
                    break;
                }

                return (
                  <Text
                    key={key}
                    style={[modalText, wordStyle]}>{text + spaceMaybeButNotAlways}
                  </Text>
                )
              })}
            </Text>
          </ScrollView>
          {
            /**
             * Modal Close Button
             */
          }
          <Animated.View style={buttonCloseContainer}>
            <AnimatedPressable
              style={[buttonClose, animatedButtonStyle, { borderColor: deckDarkColor }]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => setModalVisible(!modalVisible)}>
              <View style={buttonCloseContent}>
                <Text style={[buttonCloseText, { color: deckDarkColor }]}>Hide Story</Text>
                <Animated.View style={animatedButtonIconStyle}>
                  <SVGArrowDownToLine
                    color={deckDarkColor}
                    height="20px"
                    width="20px"
                  />
                </Animated.View>
              </View>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </View>
    </Modal>
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
  centeredView: {
    position: 'relative',
    flex: 1,
    padding: containerMargin,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalView: {
    maxHeight: '60%',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
    margin: containerMargin,
    borderWidth: 8,
    borderBottomWidth: 12,
    borderTopWidth: 12,
    borderRadius: 12,
    borderColor: colors.light.background,
    shadowColor: colors.light.border,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  modalTextContentStyle: {
    padding: 16,
  },
  modalScrollView: {
    borderColor: colors.light.background,
    backgroundColor: colors.dark.background,
    paddingBottom: 32
  },
  modalTitleStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.light.background,
    padding: 8,
    paddingTop: 0,
    width: '100%',
  },
  modalHeaderStyle: {
    backgroundColor: colors.dark.background,
    borderColor: colors.light.background,
    padding: 8,
    gap: 4,
    borderBottomWidth: 2,
  },
  modalHeaderTextStyle: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    fontSize: 14,
    textAlign: 'center',
  },
  modalHeaderMonospaceTextStyle: {
    color: colors.light.text,
    fontFamily: 'azeret-mono-600',
    fontSize: 14,
  },
  modalText: {
    textAlign: 'center',
  },
  buttonCloseContainer: {
    width: '100%',
    backgroundColor: colors.dark.background
  },
  buttonClose: {
    alignItems: 'center',
    backgroundColor: colors.light.lighterBackground,
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.dark.border,
  },
  buttonCloseContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonCloseText: {
    color: colors.dark.border,
    fontFamily: 'lexend-600',
    textAlign: 'center',
    fontSize: 16,
  },
})
