import { StyleSheet, Text, View } from "react-native";
import type { Word } from "./CardDeck/cardDeckTypes";
import { useCardDeck } from "./CardDeck/useCardDeck";

/**
 * FinishedDeckView component
 */
export default function FinishedDeckView() {
  const { cardDeckState } = useCardDeck();

  const {
    containerStyle,
    wordsContainerStyle,
    frenchWordStyle,
    userScoreStyle
  } = styles;

  const { words } = cardDeckState.cardDeck;

  console.log('THE THING WE BE MAPPIN', words);

  return (
    <View style={containerStyle}>
      {words.map((word: Word) => {
        const { frenchWord, userScore } = word;

        console.log('FRENCHWORD', frenchWord);

        return (
          <View key={`${frenchWord}-${userScore}`} style={wordsContainerStyle}>
            <Text style={frenchWordStyle}>{frenchWord}</Text>
            <Text style={userScoreStyle}>{userScore}</Text>
          </View>
        );
      })}
    </View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  containerStyle: {
    display: 'flex',
  },
  wordsContainerStyle: {
  },
  frenchWordStyle: {

  },
  userScoreStyle: {

  }
})