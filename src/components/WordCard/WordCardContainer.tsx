import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { englishArticles } from "../../util/filterFillerWords";
import getFillerWords from "../../util/getFillerWords";
import { type Word } from "../CardDeck/cardDeckTypes";
import WordCard from "./WordCard";
import WordCardButton from "./WordCardButton";
import { initialWordCardState, WordCardUIContext } from "./wordCardContext";
import WordCardSelection from "./WordCardSelection";
import { wordCardUIReducer } from "./wordCardUIReducer";

/**
 * Typing
 */
interface CardContainerProps {
  word: Word;
  isCurrent: boolean;
}

/**
 * WordCardContainer Component
 */
export default function WordCardContainer({ word, isCurrent }: CardContainerProps) {
  const { container, nextBtn } = wordCardContainerStyles;

  /**
   * State
   */
  const [fillerWords, setFillerWords] = useState<string[]>([]);
  const [articleWords, setArticleWords] = useState<string[]>([]);
  const [cardState, wordCardUIDispatch] = useReducer(
    wordCardUIReducer,
    initialWordCardState,
  );

  /**
    * Side effects
    * Load the new card and its state.
    * Note that we use the id to check for a new card.
    */
  useEffect(() => {
    async function loadWords() {
      setFillerWords(await getFillerWords({
        correctWords: word.englishWords
      }));

      if (word.englishArticle) {
        setArticleWords(await getFillerWords({
          words: englishArticles,
          correctWords: [word.englishArticle]
        }));
      } else {
        setArticleWords([]);
      }
    }

    loadWords();
  }, [
    word.frenchWord,
    word.englishWords,
    word.englishArticle,
  ]);

  /**
   * Handle current card styles
   */
  const currentPosition = useSharedValue(isCurrent ? 0 : 1000);
  const currentOpacity = useSharedValue(isCurrent ? 1 : 0);
  const positionStyle = useAnimatedStyle(() => ({
    left: currentPosition.value,
    opacity: currentOpacity.value
  }));

  /**
   * Kind of a shuffle animation effect
   */
  useLayoutEffect(() => {
    if (isCurrent) {
      currentPosition.value = withTiming(0, {
        duration: 250
      });
      currentOpacity.value = withTiming(1.0, {
        duration: 100
      });
    } else {
      currentPosition.value = withTiming(500, {
        duration: 500
      });
      currentOpacity.value = withTiming(0, {
        duration: 250
      });
    }
  }, [isCurrent, currentPosition, currentOpacity]);

  return (
    <WordCardUIContext.Provider value={{ cardState, wordCardUIDispatch }}>
      <Animated.View style={[
        container,
        positionStyle
      ]
      }>
        <WordCard isCurrent={isCurrent} />
        <WordCardSelection
          articleWords={articleWords}
          fillerWords={fillerWords}
        />
        <WordCardButton style={nextBtn}>
          {
            cardState.stage === 'CORRECT' ||
              cardState.stage === 'INCORRECT'
              ? 'Next card →' : 'Check'
          }
        </WordCardButton>
      </Animated.View>
    </WordCardUIContext.Provider >
  )
}

/**
 * Styles
 */
const wordCardContainerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 500,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    height: '100%',
  },
  nextBtn: {
    margin: 24
  }
});
