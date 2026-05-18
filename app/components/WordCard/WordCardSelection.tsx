import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { CardContext } from './cardContext';
import MappedWords from './MappedWords';

/**
 * Typing
 */
interface WordCardSelectionProps {
  articleWords: string[];
  fillerWords: string[];
}

/**
 * WordCardSelection Component
 */
export default function WordCardSelection({ articleWords, fillerWords }: WordCardSelectionProps) {
  const { cardState, setCardState } = useContext(CardContext);
  const { wcsContainer } = wordCardSelectionStyles;

  const handleArticlePressToggle = (word: string) => {
    setCardState((cardState) => {
      if (word !== cardState.selectedArticle) {
        return ({ ...cardState, selectedArticle: word })
      } else {
        return ({ ...cardState, selectedArticle: null })
      }
    });
  }

  const handleWordPressToggle = (word: string) => {
    setCardState((cardState) => {
      if (word !== cardState.selectedWord) {
        return ({ ...cardState, selectedWord: word })
      } else {
        return ({ ...cardState, selectedWord: null })
      }
    });
  }

  return (
    <View style={wcsContainer}>
      {MappedWords({
        words: articleWords,
        activeWord: cardState.selectedArticle,
        handler: handleArticlePressToggle
      })}
      {MappedWords({
        words: fillerWords,
        activeWord: cardState.selectedWord,
        handler: handleWordPressToggle
      })}
    </View>
  )
}

/**
 * Styles
 */
const wordCardSelectionStyles = StyleSheet.create({
  wcsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    margin: 24
  },
});