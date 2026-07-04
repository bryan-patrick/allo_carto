/**
 * Could these thoughts belong to the beast from the abyss? If that were true, then perhaps it is no beast afterall
 */

import colors from "@/src/app/colors";
import sharedStyles from "@/src/app/sharedStyles";
import { StyleSheet, Text, View } from "react-native";
import { Word } from "../CardDeck/cardDeckTypes";
import { useCardDeck } from "../CardDeck/useCardDeck";

/**
 * DeckProgress component
 */
export default function DeckProgress() {
  /**
   * State
   */
  const { cardDeckState } = useCardDeck();

  /**
   * Destructuring
   */
  const { cardDeck: currentCardDeck, currentIndex } = cardDeckState;
  const { words } = currentCardDeck;
  const {
    deckProgressContainerStyle,
    progressTextStyle,
    blipContainerStyle,
    blipStyle,
  } = styles;

  /**
   * Card vars
   */
  const totalCards = words.length;
  const currentCard = currentIndex + 1;

  /**
   * Render the component
   */
  return (
    <View style={deckProgressContainerStyle}>
      <Text style={progressTextStyle}>Card {currentCard}/{totalCards}</Text>
      <View style={blipContainerStyle}>
        {
          words.map((word: Word) => {
            return (
              <View
                key={`progress-blip-${word.id}`}
                style={blipStyle}
              />
            )
          })
        }
      </View>
    </View >
  )
}

/**
 * Shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  deckProgressContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    marginTop: 4,
    marginBottom: 4,
    marginRight: containerMargin,
    marginLeft: containerMargin,
    borderWidth: 2,
    padding: 8,
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.light.background,
  },
  progressTextStyle: {
    fontFamily: 'azeret-mono-600',
    fontSize: 12,
    color: colors.light.background
  },
  blipContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 10,
  },
  blipStyle: {
    height: 4,
    flexGrow: 1,
    flexShrink: 1,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.light.background
  }
});