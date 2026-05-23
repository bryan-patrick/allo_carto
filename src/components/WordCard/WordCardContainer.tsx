import { useEffect, useLayoutEffect, useState } from "react";
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { englishArticles } from "../../util/filterFillerWords";
import getFillerWords from "../../util/getFillerWords";
import WordCard from "./WordCard";
import WordCardButton from "./WordCardButton";
import { initialWordCardState, WordCardContext, WordProps, type WordCardStateProps } from "./wordCardContext";
import WordCardSelection from "./WordCardSelection";

/**
 * Typing
 */
interface CardContainerProps {
  word: WordProps;
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
  const [cardState, setCardState] = useState<WordCardStateProps>({
    ...initialWordCardState,
    correctArticle: word.englishArticle ?? null,
    correctWord: word.translation ?? null,
  });

  /**
    * Side effects
    * Load the new card and its state.
    * Note that we use the id to check for a new card.
    */
  useEffect(() => {
    if (cardState.word.id !== word.id) {
      setCardState({
        ...initialWordCardState,
        word,
        correctArticle: word.englishArticle ?? null,
        correctWord: word.translation ?? null,
      });

      async function loadWords() {
        setFillerWords(await getFillerWords({
          correctWord: word.translation
        }));

        if (word.englishArticle) {
          setArticleWords(await getFillerWords({
            words: englishArticles,
            correctWord: word.englishArticle
          }))
        }

      }

      loadWords();
    }
  }, [cardState.word.id, word]);

  /**
   * I'm not crazy about this...
   * 
   * ...but this is here for when our 
   * deck reducer updates our current card,
   * it needs to be in sync with the current
   * cardContext.
   * 
   * TODO: Is there another way? A better funnel down to our card context?
   */
  useEffect(() => {
    setCardState((prev) => {
      if (prev.word.id !== word.id) return prev;

      return {
        ...prev,
        word,
      };
    });
  }, [word]);

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
    <WordCardContext.Provider value={{ cardState, setCardState }}>
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
    </WordCardContext.Provider >
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
