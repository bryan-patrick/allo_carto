import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { englishArticles } from "../../util/filterFillerWords";
import getFillerWords from "../../util/getFillerWords";
import { CardContext, type CardStateProps, initialCardState } from "./cardContext";
import WordCard, { WordProps } from "./WordCard";
import WordCardSelection from "./WordCardSelection";

/**
 * Typing
 */
interface CardContainerProps {
  word: WordProps
}

/**
 * WordCardContainer Component
 */
export default function WordCardContainer({ word }: CardContainerProps) {
  const [fillerWords, setFillerWords] = useState<string[]>([]);
  const [articleWords, setArticleWords] = useState<string[]>([]);
  const [cardState, setCardState] = useState<CardStateProps>(initialCardState);

  useEffect(() => {
    async function loadWords() {
      setFillerWords(await getFillerWords({
        correctWord: word.id
      }));

      if (word.englishArticle) {
        setArticleWords(await getFillerWords({
          words: englishArticles,
          correctWord: word.englishArticle
        }))
      }
    }

    loadWords();
  }, [word.id, word.englishArticle]);

  return (
    <CardContext.Provider value={{ cardState, setCardState }}>
      <View>
        <WordCard word={word} />
        <WordCardSelection
          articleWords={articleWords}
          fillerWords={fillerWords}
        />
        <Pressable>
          <Text>Next Card</Text>
        </Pressable>
      </View>
    </CardContext.Provider>
  )
}
