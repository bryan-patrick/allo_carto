import GradientText from "@/src/components/GradientText";
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import sharedStyles from "../../app/sharedStyles";
import type { DeckRankCounts } from "../../db/queries/getDeckRankCounts";
import { getDeckCompletionPercent } from "../../util/deckCompletion";
import type { WordProgressKey } from "../../util/wordRanks";
import type { CardDeck } from "../CardDeck/cardDeckTypes";
import SecondaryButton from "../SecondaryButton";
import SVGArrowDownToLine from "../SVG/SVGArrowDownToLine";

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
    modalFooterStyle,
    buttonClose,
    buttonCloseText,
  } = styles;

  /**
   * Header deck completion percentage 
   */
  const wordsSeenCount = rankCounts.seen;
  const deckCompletionPercent = getDeckCompletionPercent({
    deckWordCount: deck.wordIds.length,
    rankCounts,
  });

  /**
   * Render the modal
   */
  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      backdropColor={colors.dark.text}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={centeredView}>
        <View style={modalView}>
          <View style={modalTitleStyle}>
            <GradientText
              colors={[ deck.colors.dark.primary, deck.colors.dark.secondary ]}
              fontSize={18}
              fontWeight={700}
              text={deck.title}
            />
          </View>
          <View style={[
            modalHeaderStyle,
            { borderColor: deck.colors.dark.primary }
          ]}>
            <Text style={[
              modalHeaderTextStyle,
              { color: deck.colors.dark.primary }
            ]}>
              Deck Completion: <Text style={[
                modalHeaderMonospaceTextStyle,
                { color: deck.colors.dark.primary }
              ]}>{deckCompletionPercent}%</Text>
            </Text>
            <Text style={[
              modalHeaderTextStyle,
              { color: deck.colors.dark.primary }
            ]}>
              Words Seen: <Text style={[ modalHeaderMonospaceTextStyle, { color: deck.colors.dark.primary } ]}>{wordsSeenCount}/{deck.wordIds.length}</Text>
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
                const progress = wordProgressKeyByWordId[ wordId ?? '' ] ?? 'unseen';
                const progressColor = progress === 'unseen'
                  ? colors.dark.border
                  : colors.light.rank[ progress ];

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
                };

                switch (progress) {
                  case "unseen":
                    wordStyle.color = 'transparent';
                    wordStyle.textDecorationColor = colors.light.border;
                    break;
                  case "fnew":
                    wordStyle.opacity = 0.1;
                    wordStyle.color = '#8DABAF';
                    break;
                  case "silver":
                    break;
                  case "gold":
                    wordStyle.textShadowRadius = 2;
                    break;
                  case "diamond":
                    wordStyle.textShadowRadius = 8;
                    break;
                }

                return (
                  <Text
                    key={key}
                    style={modalText}>
                    <Text style={wordStyle}>{text}</Text>
                    {spaceMaybeButNotAlways}
                  </Text>
                );
              })}
            </Text>
          </ScrollView>
          {
            /**
             * Modal footer
             */
          }
          <View style={modalFooterStyle}>
            <SecondaryButton
              style={[ buttonClose, {
                borderColor: deck.colors.dark.primary,
                shadowColor: deck.colors.dark.primary,
              } ]}
              textStyle={[ buttonCloseText, { color: deck.colors.dark.primary } ]}
              onPress={() => setModalVisible(!modalVisible)}
              SVGElement={
                <SVGArrowDownToLine
                  color={deck.colors.dark.primary}
                  height="20px"
                  width="20px"
                />
              }
            >
              Hide Story
            </SecondaryButton>
          </View>
        </View>
      </View>
    </Modal>
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
  centeredView: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 8,
    flex: 1,
  },
  modalView: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
    margin: containerMargin,
  },
  modalTextContentStyle: {
    padding: 8,
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
    backgroundColor: colors.light.background,
    paddingTop: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    width: '100%',
  },
  modalHeaderStyle: {
    backgroundColor: colors.light.background,
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
    color: colors.light.text,
    fontFamily: 'lexend-400',
    fontSize: 16,
    lineHeight: 32,
    textAlign: 'left',
  },
  modalFooterStyle: {
    backgroundColor: colors.light.background,
    width: '100%',
    padding: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderColor: colors.dark.border,
  },
  buttonClose: {
    padding: 16,
  },
  buttonCloseText: {
  },
});
