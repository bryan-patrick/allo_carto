import { storyAtlas } from '@/data/french/storyAtlas';
import sharedStyles from '@/src/app/sharedStyles';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import { useCardDeck } from '../CardDeck/useCardDeck';
import LinkButton from '../LinkButton';
import ResultsList from '../ResultsList';

const englishVowels = ['a', 'e', 'i', 'o', 'u', 'y'];

/**
 * Typing
 */
interface DeckAtlasLocation {
	chapterId: string;
	storyId: string;
}

/**
 * Find the story and chapter that contain a completed deck
 */
function findDeckAtlasLocation(cardDeck: CardDeck): DeckAtlasLocation | undefined {
	for (const story of storyAtlas.stories) {
		for (const chapter of story.chapters) {
			const deck = chapter.decks.find(deck => {
				if (deck.id === cardDeck.id) return true;

				const isSameTitle = deck.title === cardDeck.title;
				const hasSameWordCount = deck.wordIds.length === cardDeck.wordIds.length;
				const hasSameWords = deck.wordIds.every(wordId => {
					return cardDeck.wordIds.includes(wordId);
				});

				return isSameTitle && hasSameWordCount && hasSameWords;
			});

			if (deck) return { chapterId: chapter.id, storyId: story.id };
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
	/**
	 * Context and result metadata
	 */
	const { cardDeckState } = useCardDeck();
	const { title } = cardDeckState.cardDeck;
	const { correctWords, incorrectWords } = cardDeckState;
	const isFirstLetterAVowel = englishVowels.includes(title.split('')[0].toLowerCase());
	const resultsTitleArticle = isFirstLetterAVowel ? 'an' : 'a';
	const atlasLocation = findDeckAtlasLocation(cardDeckState.cardDeck);
	const storyColor = getDeckStoryColor(cardDeckState.cardDeck.id);

	/**
	 * Return to the completed deck's chapter and reopen its deck picker
	 */
	function handleFinish() {
		if (atlasLocation) {
			router.dismissTo({
				pathname: '/ChapterSelect',
				params: {
					...atlasLocation,
					deckPickerRequest: String(Date.now()),
				},
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
						<Text style={[styles.title, { color: storyColor }]}>{title}</Text>
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
