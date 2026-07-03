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

  /**
   * Animation vars
   */
  const top = useSharedValue(0);
  const shadowOffsetHeight = useSharedValue(8);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    top: top.value,
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowOffset: {
      width: 0,
      height: shadowOffsetHeight.value
    },
  }));

  /**
   * Handle animations on pressed
   */
  useEffect(() => {
    if (isPressed) {
      top.value = withTiming(0, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      });

      shadowOffsetHeight.value = withTiming(0, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      top.value = -4;
      shadowOffsetHeight.value = 4;
    }

  }, [isPressed, shadowOffsetHeight, top])

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
                  fontSize: 14,
                  fontWeight: '400',
                  color: colors.light.rank[rank],
                  backgroundColor: 'transparent',
                  borderColor: colors.light.border,
                  fontFamily: 'lexend',
                  borderBottomWidth: 1,
                  opacity: 0,
                }

                switch (rank) {
                  case "fnew":
                    wordStyle.fontSize = 12;
                    wordStyle.color = colors.light.rank.fnew;
                    wordStyle.opacity = 0.1;

                    let length = text.length;
                    text = Array.from({ length }, () => '#').join('');;

                    break;
                  case "bronze":
                    wordStyle.fontSize = 16;
                    wordStyle.opacity = 1
                    break;
                  case "silver":
                    wordStyle.fontFamily = 'lexend-600'
                    wordStyle.fontSize = 20;
                    wordStyle.opacity = 0.85
                    break;
                  case "gold":
                    wordStyle.fontFamily = 'lexend-700'
                    wordStyle.fontSize = 22;
                    wordStyle.opacity = 1
                    break;
                  case "diamond":
                    wordStyle.fontSize = 24;
                    wordStyle.opacity = 1
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
          <Animated.View style={[buttonCloseContainer, animatedContainerStyle]}>
            <AnimatedPressable
              style={[buttonClose, animatedShadowStyle]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => setModalVisible(!modalVisible)}>
              <View style={buttonCloseContent}>
                <Text style={buttonCloseText}>Hide Story</Text>
                <SVGArrowDownToLine
                  color={colors.light.text}
                  height="20px"
                  width="20px"
                />
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
    maxHeight: '75%',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
    margin: containerMargin,
    borderWidth: 8,
    borderRadius: 24,
    backgroundColor: colors.dark.darkerBackground,
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
    borderRadius: 16,
    padding: 16,
  },
  modalScrollView: {
    width: '100%',
    borderBottomWidth: 8,
    borderColor: colors.light.background
  },
  modalTitleStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.light.background,
    padding: 8,
    width: '100%',
  },
  modalHeaderStyle: {
    alignItems: 'center',
    backgroundColor: colors.dark.border,
    borderBottomWidth: 4,
    borderColor: colors.light.background,
    gap: 4,
    padding: 8,
    width: '100%',
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
    color: 'transparent',
  },
  buttonCloseContainer: {
    width: '100%',
    padding: 1,
    borderRadius: 0,
    borderColor: colors.light.background,
    backgroundColor: colors.light.background,
  },
  buttonClose: {
    alignItems: 'center',
    backgroundColor: colors.dark.primary,
    justifyContent: 'center',
    padding: 16,
    width: '100%',
    borderWidth: 2,
    borderBottomWidth: 8,
    borderColor: colors.dark.border,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    shadowColor: colors.dark.border,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  buttonCloseContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonCloseText: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    textAlign: 'center',
    fontSize: 16,
  },
})
