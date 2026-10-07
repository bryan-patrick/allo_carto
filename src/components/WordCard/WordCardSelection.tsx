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
	const { cardState, wordCardUIDispatch } = useWordCardUI();

	const handleArticlePressToggle = useCallback(
		(word: string) => {
			wordCardUIDispatch({ type: 'SELECT_ARTICLE', word });
		},
		[wordCardUIDispatch],
	);

	const handleWordPressToggle = useCallback(
		(word: string) => {
			wordCardUIDispatch({ type: 'SELECT_WORD', word });
		},
		[wordCardUIDispatch],
	);

	/**
	 * Render the mapped words
	 */
	return (
		<View style={styles.container}>
			<MappedWords
				selectionType="article"
				words={articleWords}
				activeWord={cardState.selectedArticle}
				handler={handleArticlePressToggle}
			/>
			<MappedWords
				selectionType="word"
				words={fillerWords}
				activeWord={cardState.selectedWord}
				handler={handleWordPressToggle}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
});
