import { deckAtlas } from '@/data/french/deckAtlas';
import sharedStyles from '@/src/app/sharedStyles';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import { useCardDeck } from '../CardDeck/useCardDeck';
import GradientText from '../GradientText';
import LinkButton from '../LinkButton';
import ResultsList from '../ResultsList';

const englishVowels = ['a', 'e', 'i', 'o', 'u', 'y'];

function findDeckPlaceId(cardDeck: CardDeck) {
	for (const chapter of deckAtlas.chapters) {
		for (const place of chapter.places) {
			const deck = place.decks.find(deck => {
				const isSameTitle = deck.title === cardDeck.title;
				const hasSameWordCount = deck.wordIds.length === cardDeck.wordIds.length;
				const hasSameWords = deck.wordIds.every(wordId => {
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
	const isFirstLetterAVowel = englishVowels.includes(title.split('')[0].toLowerCase());
	const resultsTitleArticle = isFirstLetterAVowel ? 'an' : 'a';
	const placeId = findDeckPlaceId(cardDeckState.cardDeck);

	function handleFinish() {
		if (placeId) {
			router.dismissTo({
				pathname: '/CardDeckSelect',
				params: { placeId },
			});
			return;
		}

		router.replace('/(tabs)');
	}

	/**
	 * Render the deck results
	 */
	return (
		<ScrollView>
			<View style={styles.resultsContainer}>
				<View>
					<View style={styles.titleRow}>
						<Text style={styles.title}>Good job! You completed {resultsTitleArticle} </Text>
						<GradientText
							text={title}
							colors={[
								cardDeckState.cardDeck.colors.dark.primary,
								cardDeckState.cardDeck.colors.dark.secondary,
							]}
							fontSize={20}
							fontWeight={600}
						/>
						<Text style={styles.title}> deck.</Text>
					</View>
				</View>
				<View style={styles.wordsFlexRows}>
					<ResultsList
						wordArr={correctWords}
						isCorrect={true}
					/>
					<ResultsList
						wordArr={incorrectWords}
						isCorrect={false}
					/>
				</View>
				<LinkButton handler={handleFinish}>Finish</LinkButton>
			</View>
		</ScrollView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	resultsContainer: {
		display: 'flex',
		backgroundColor: colors.light.background,
		margin: sharedStyles.containerMargin,
		borderRadius: 16,
		boxShadow: `0 16px 0 ${colors.dark.border}`,
		overflow: 'hidden',
		borderWidth: 6,
		borderColor: colors.light.border,
		padding: 16,
		gap: 16,
	},
	titleRow: {
		alignItems: 'baseline',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	title: {
		fontSize: 20,
		fontFamily: 'lexend-400',
	},
	wordsFlexRows: {
		display: 'flex',
		gap: 8,
	},
});
