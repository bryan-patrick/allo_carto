import { View } from 'react-native';
import type { WordProps } from './components/WordCard/cardContext';
import WordCardContainer from "./components/WordCard/WordCardContainer";

/**
 * TODO remove
 */
const mockWord: WordProps = {
  id: 'chat',
  translation: 'cat',
  lemmaId: 'chat',
  frenchArticle: 'le',
  englishArticle: 'The',
  partOfSpeech: 'noun',
  CEFRLevel: 'A1',
  gender: 'masculine',
  pronunciation: 'luh shah',
  userScore: 12
}

export default function DeckView() {
  return (
    <View>
      <WordCardContainer word={mockWord} />
    </View>
  )
}