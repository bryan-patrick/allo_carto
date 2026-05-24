import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import MappedWords from './MappedWords';
import { useWordCardUI } from './useWordCardUI';

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
  const { cardState, setCardState } = useWordCardUI();
  const { wcsContainer } = wordCardSelectionStyles;

  const handleArticlePressToggle = useCallback((word: string) => {
    if (cardState.stage === 'READY') {
      setCardState((cardState) => ({
        ...cardState,
        selectedArticle: word !== cardState.selectedArticle ? word : null,
        mistake: 'NONE',
        progress: 'PENDING'
      }));
    }
  }, [
    cardState.stage,
    setCardState
  ]);

  const handleWordPressToggle = useCallback((word: string) => {
    if (cardState.stage === 'READY') {
      setCardState((cardState) => ({
        ...cardState,
        selectedWord: word !== cardState.selectedWord ? word : null,
        mistake: 'NONE',
        progress: 'PENDING'
      }));
    }
  }, [
    cardState.stage,
    setCardState
  ]);

  return (
    <View style={wcsContainer}>
      <MappedWords
        words={articleWords}
        activeWord={cardState.selectedArticle}
        handler={handleArticlePressToggle}
      />
      <MappedWords
        words={fillerWords}
        activeWord={cardState.selectedWord}
        handler={handleWordPressToggle}
      />
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
