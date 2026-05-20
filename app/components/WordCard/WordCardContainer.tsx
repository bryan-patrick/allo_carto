import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { englishArticles } from "../../util/filterFillerWords";
import getFillerWords from "../../util/getFillerWords";
import { CardContext, type CardStateProps, initialCardState, WordProps } from "./cardContext";
import WordCard from "./WordCard";
import WordCardButton from "./WordCardButton";
import WordCardSelection from "./WordCardSelection";

/**
 * Typing
 */
interface CardContainerProps {
  word: WordProps;
}

/**
 * WordCardContainer Component
 */
export default function WordCardContainer({ word }: CardContainerProps) {
  const { container, nextBtn } = wordCardContainerStyles;

  /**
   * State
   */
  const [fillerWords, setFillerWords] = useState<string[]>([]);
  const [articleWords, setArticleWords] = useState<string[]>([]);
  const [cardState, setCardState] = useState<CardStateProps>({
    ...initialCardState,
    correctArticle: word.englishArticle ?? null,
    correctWord: word.translation ?? null,
  });

  /**
   * Side effects - Load the card and its state
   */
  useEffect(() => {
    setCardState({
      ...initialCardState,
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
  }, [word.translation, word.englishArticle, word]);

  return (
    <CardContext.Provider value={{ cardState, setCardState }}>
      <View style={container}>
        <WordCard />
        <WordCardSelection
          articleWords={articleWords}
          fillerWords={fillerWords}
        />
        <WordCardButton style={nextBtn}>
          {cardState.isCorrect ? 'Next card' : 'Check'}
        </WordCardButton>
      </View>
    </CardContext.Provider >
  )
}

const wordCardContainerStyles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    height: '100%',
  },
  nextBtn: {
    margin: 24
  }
});
