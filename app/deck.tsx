import { Text, View } from "react-native";
import WordCard, { WordProps } from "./components/WordCard";

/**
 * TODO remove
 */
const exampleWord: WordProps = {
  id: 'chat',
  translation: 'cat',
  lemmaId: 'chat',
  frenchArticle: 'le',
  englishArticle: 'The',
  partOfSpeech: 'noun',
  CEFRLevel: 'A1',
  gender: 'masculine',
  pronunciation: 'lay shaw',
  userScore: 12
}

export default function DeckView() {
  return (
    <View>
      <Text>Learn new words</Text>
      <WordCard word={exampleWord} />

    </View>
  )
}