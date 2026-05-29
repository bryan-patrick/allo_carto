import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from "../../app/styles";
import type { Word } from "../CardDeck/cardDeckTypes";
import { useCardDeck } from "../CardDeck/useCardDeck";
import GradientText from '../GradientText';
import LinkButton from '../LinkButton';
import ResultsList from './ResultsList';

/**
 * DeckResultsView component
 * 
 * TODO: We need to derive all sorts
 * of components from this thing
 */
export default function DeckResultsView() {
  const { cardDeckState } = useCardDeck();
  const { words } = cardDeckState.cardDeck;
  const correctWords = words.filter((word: Word) => word.userScore === 1);
  const incorrectWords = words.filter((word: Word) => word.userScore === 0);

  /**
   * Destructure styles
   */
  const {
    titleStyle,
    titleRowStyle,
    deckDetailsContainerStyle,
    resultsContainerStyle,
    wordsFlexRows,
    imageContainerStyle,
    imageStyle,
    finishedLinkStyle
  } = styles;

  /**
   * Render the deck results
   */
  return (
    <ScrollView>
      <View style={resultsContainerStyle}>
        <View style={deckDetailsContainerStyle}>
          <View>
            <View style={titleRowStyle}>
              <Text style={titleStyle}>Good job! You completed a </Text>
              <GradientText
                text='Coffee Shop'
                colors={[colors.dark.primary, colors.dark.text]}
                fontSize={20}
                fontWeight={700}
              />
              <Text style={titleStyle}> deck.</Text>
            </View>
          </View>
          <View style={imageContainerStyle}>
            <ImageBackground
              source={cardDeckState.cardDeck.image}
              style={imageStyle}
            />
          </View>
        </View>
        <View style={wordsFlexRows}>
          <ResultsList
            wordArr={correctWords}
            isCorrect={true}
          />
          <ResultsList
            wordArr={incorrectWords}
            isCorrect={false}
          />
        </View>
        <LinkButton screen="(tabs)" style={finishedLinkStyle}>Finish</LinkButton>
      </View>
    </ScrollView>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  resultsContainerStyle: {
    display: 'flex',
    backgroundColor: colors.light.background,
    margin: 32,
    borderRadius: 16,
    boxShadow: `0 16px 0 ${colors.dark.border}`,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: colors.light.border,
  },
  deckDetailsContainerStyle: {

  },
  titleRowStyle: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8
  },
  titleStyle: {
    fontSize: 20,
    fontWeight: 700,
  },
  imageContainerStyle: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.light.border
  },
  imageStyle: {
    height: 200,
  },
  wordsFlexRows: {
    display: 'flex',
    gap: 8,
    padding: 16,
  },
  finishedLinkStyle: {
    margin: 16
  }
})
