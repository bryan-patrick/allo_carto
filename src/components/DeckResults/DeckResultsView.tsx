import sharedStyles from '@/src/app/sharedStyles';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from "../../app/colors";
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
  const { title } = cardDeckState.cardDeck;
  const { correctWords, incorrectWords } = cardDeckState;

  const deckColorDark = cardDeckState.cardDeck.colors?.dark ?? colors.dark.primary;
  const deckColorLight = cardDeckState.cardDeck.colors?.light ?? colors.light.primary;

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
          <View style={titleRowStyle}>
            <Text style={titleStyle}>Good job! You completed a </Text>
            <GradientText
              text={title}
              colors={[deckColorDark, deckColorLight]}
              fontSize={20}
              fontWeight={900}
            />
            <Text style={titleStyle}> deck.</Text>
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
 * Destructure shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  resultsContainerStyle: {
    display: 'flex',
    backgroundColor: colors.light.background,
    margin: containerMargin,
    borderRadius: 16,
    boxShadow: `0 16px 0 ${colors.dark.border}`,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: colors.light.border,
  },
  deckDetailsContainerStyle: {},
  titleRowStyle: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16
  },
  titleStyle: {
    fontSize: 20,
    fontWeight: 500,
  },
  imageContainerStyle: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.light.border
  },
  imageStyle: {
    height: 175,
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
