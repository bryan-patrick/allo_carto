import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import DeckBox from '@/src/components/DeckBox';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findChapterById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import colors from '../colors';

/**
 * CardDeckSelect component
 */
export default function CardDeckSelect() {
	const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();
	const { progressById, status } = useUserProgress();

	const chapter = findChapterById(chapterId);
	const decks =
		chapter?.decks.map(deck => ({
			...deck,
			chapter: chapter.name,
		})) ?? [];

	/**
	 * Check a deck's lock
	 */
	function getIsDeckLocked(deck: CardDeck): boolean {
		return !isItemUnlocked({ id: deck.id, progressById });
	}

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load deck progress.</Text>;

	/**
	 * Block locked chapters
	 */
	if (chapter && !isItemUnlocked({ id: chapter.id, progressById })) {
		return (
			<View style={styles.noDecksContainer}>
				<Text style={styles.noDecksText}>This chapter is locked.</Text>
			</View>
		);
	}

	/**
	 * Render the card grid
	 */
	return (
		<>
			<View style={styles.deckNameContainer}>
				<Text style={styles.deckNameText}>{chapter?.name}</Text>
			</View>
			{decks.length > 0 && (
				<FlatList
					/**
					 * BG color is for scroll bounce
					 */
					style={{ backgroundColor: colors.dark.text }}
					contentContainerStyle={styles.cardGrid}
					renderItem={({ item }) => (
						<DeckBox
							deck={item}
							isLocked={getIsDeckLocked(item)}
							chapterId={chapterId}
						/>
					)}
					keyExtractor={deck => deck.id}
					overScrollMode="always"
					data={decks}
				/>
			)}
			{decks.length === 0 && (
				<View style={styles.noDecksContainer}>
					<Text style={styles.noDecksText}>Sorry! No decks found.</Text>
				</View>
			)}
		</>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	deckNameContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
		backgroundColor: colors.dark.text,
	},
	deckNameText: {
		textAlign: 'center',
		width: '100%',
		fontFamily: 'lexend-600',
		fontSize: 18,
		color: colors.light.text,
	},
	cardGrid: {
		display: 'flex',
		backgroundColor: colors.dark.text,
		gap: 8,
		margin: 8,
	},
	noDecksContainer: {
		display: 'flex',
		padding: 12,
	},
	noDecksText: {
		textAlign: 'center',
		color: colors.light.text,
	},
});
