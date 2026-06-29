import { deckAtlas } from '@/data/french/deckAtlas';
import sharedStyles from '@/src/app/sharedStyles';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { router } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from "../../app/colors";
import { useCardDeck } from "../CardDeck/useCardDeck";
import GradientText from '../GradientText';
import LinkButton from '../LinkButton';
import ResultsList from './ResultsList';

const englishVowels = ['a', 'e', 'i', 'o', 'u', 'y']

function findDeckPlaceId(cardDeck: CardDeck) {
  for (const chapter of deckAtlas.chapters) {
    for (const place of chapter.places) {
      const deck = place.decks.find((deck) => {
        const isSameTitle = deck.title === cardDeck.title;
        const hasSameWordCount = deck.wordIds.length === cardDeck.wordIds.length;
        const hasSameWords = deck.wordIds.every((wordId) => {
          return cardDeck.wordIds.includes(wordId);
        });

        return isSameTitle && hasSameWordCount && hasSameWords;
      });

      if (deck) return place.id;
    }
  }
}

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
  const isFirstLetterAVowel = englishVowels.includes(title.split('')[0].toLowerCase());
  const resultsTitleArticle = isFirstLetterAVowel ? 'an' : 'a'
  const placeId = findDeckPlaceId(cardDeckState.cardDeck);

  function handleFinish() {
    if (placeId) {
      router.replace({
        pathname: '/CardDeckSelect',
        params: { placeId },
      });
      return;
    }

    router.replace('/(tabs)');
  }

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
            <Text style={titleStyle}>Good job! You completed {resultsTitleArticle} </Text>
            <GradientText
              text={title}
              colors={[deckColorDark, deckColorLight]}
              fontSize={20}
              fontWeight={600}
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
        <LinkButton handler={handleFinish} style={finishedLinkStyle}>Finish</LinkButton>
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
    fontFamily: 'lexend-400',
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
