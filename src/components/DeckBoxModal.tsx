import GradientText from "@/src/components/GradientText";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from "../app/colors";
import sharedStyles from "../app/sharedStyles";
import type { DeckRankCounts } from "../db/queries/getDeckRankCounts";
import type { WordProgressKey } from "../util/wordRanks";
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
  wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * DeckBoxModal component
 */
export default function DeckBoxModal({
  deck,
  modalVisible,
  rankCounts,
  setModalVisible,
  wordProgressKeyByWordId,
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
  const wordsSeenCount = rankCounts.seen;
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
          <View style={[modalHeaderStyle, { borderColor: deckDarkColor }]}>
            <Text style={[modalHeaderTextStyle, { color: deckDarkColor }]}>
              Deck Completion: <Text style={[modalHeaderMonospaceTextStyle, { color: deckDarkColor }]}>{deckCompletionPercent}%</Text>
            </Text>
            <Text style={[modalHeaderTextStyle, { color: deckDarkColor }]}>
              Words Seen: <Text style={[modalHeaderMonospaceTextStyle, { color: deckDarkColor }]}>{wordsSeenCount}/{deck.wordIds.length}</Text>
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
                const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';
                const progressColor = progress === 'unseen'
                  ? colors.dark.border
                  : colors.light.rank[progress];

                const wordStyle: any = {
                  fontSize: 16,
                  color: progressColor,
                  textShadowColor: progressColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 0,
                  fontFamily: 'lexend-400',
                  lineHeight: 32,
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'dotted',
                  textDecorationColor: 'transparent',
                }

                switch (progress) {
                  case "unseen":
                    wordStyle.color = 'transparent';
                    wordStyle.textDecorationColor = colors.light.border;
                    break;
                  // case "fnew":
                  //   break;
                  // case "bronze":
                  //   break;
                  case "silver":
                    wordStyle.textShadowRadius = 4;
                    break;
                  case "gold":
                    wordStyle.textShadowRadius = 8;
                    break;
                  case "diamond":
                    wordStyle.textShadowRadius = 16;
                    break;
                }

                return (
                  <Text
                    key={key}
                    style={modalText}>
                    <Text style={wordStyle}>{text}</Text>
                    {spaceMaybeButNotAlways}
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
    maxHeight: '65%',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
    margin: containerMargin,
    borderWidth: 8,
    borderBottomWidth: 12,
    borderTopWidth: 12,
    borderRadius: 12,
    backgroundColor: colors.light.lighterBackground,
    borderColor: colors.light.background,
    shadowColor: colors.light.border,
    shadowOffset: {
      width: 0,
      height: 8,
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
  },
  modalTitleStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.light.lighterBackground,
    paddingTop: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    width: '100%',
  },
  modalHeaderStyle: {
    backgroundColor: colors.light.lighterBackground,
    borderColor: colors.light.background,
    padding: 8,
    gap: 4,
    borderRightWidth: 2,
    borderLeftWidth: 2,
  },
  modalHeaderTextStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    fontSize: 14,
    textAlign: 'center',
  },
  modalHeaderMonospaceTextStyle: {
    color: colors.dark.text,
    fontFamily: 'azeret-mono-600',
    fontSize: 14,
  },
  modalText: {
    textAlign: 'left',
  },
  buttonCloseContainer: {
    width: '100%',
    backgroundColor: colors.dark.background,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8
  },
  buttonClose: {
    alignItems: 'center',
    backgroundColor: colors.light.lighterBackground,
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.dark.border,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8
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
