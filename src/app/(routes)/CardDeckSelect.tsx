import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import DeckBox from '@/src/components/DeckBox';
import Loader from '@/src/components/Loader';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findChapterById, getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../colors';

const deckSelectBackgroundImage = require('@/src/app/assets/images/decks/deck-select-bg.jpg');

/**
 * CardDeckSelect component
 */
export default function CardDeckSelect() {
	const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();
	const { progressById, status } = useUserProgress();
	const paddingTop = useSafeAreaInsets().top;
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
		<ImageBackground
			style={styles.screenBackground}
			source={deckSelectBackgroundImage}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContentContainer}
				style={styles.scrollView}
			>
				<View style={[styles.chapterHeader, { paddingTop }]}>
					<MaterialSymbol
						name="owl"
						size={32}
						style={styles.chapterIcon}
						color={colors.light.goldenBorder}
					/>
					<Text style={styles.chapterTitleText}>Select a Deck</Text>
					<Text style={styles.chapterDescriptionText}>
						Preview a deck’s passage, or select it to begin practicing its words.
					</Text>
				</View>
				{decks.length > 0 && (
					<View style={styles.cardGrid}>
						{decks.map(deck => (
							<View key={deck.id}>
								<DeckBox
									deck={deck}
									isLocked={getIsDeckLocked(deck)}
									chapterId={chapterId}
									unlockCriteria={getUnlockCriteria(deck, progressById)}
								/>
							</View>
						))}
					</View>
				)}
				{decks.length === 0 && (
					<View style={styles.noDecksContainer}>
						<Text style={styles.noDecksText}>Sorry! No decks found.</Text>
					</View>
				)}
			</ScrollView>
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	screenBackground: {
		height: '100%',
	},
	scrollContentContainer: {
		display: 'flex',
		flexGrow: 1,
		padding: 8,
		gap: 16,
	},
	scrollView: {
		backgroundColor: 'rgba(15, 15, 13, 0.4)',
	},
	chapterHeader: {
		marginTop: 40,
		padding: 4,
		gap: 4,
	},
	chapterIcon: {
		textShadowColor: '#000000',
		textShadowRadius: 20,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	chapterTitleText: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		textAlign: 'center',
		color: colors.light.background,
		textShadowColor: '#000000',
		textShadowRadius: 50,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	chapterDescriptionText: {
		textAlign: 'center',
		fontFamily: 'lexend-400',
		color: colors.light.goldenBorder,
		textShadowColor: '#000000',
		textShadowRadius: 20,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	cardGrid: {
		display: 'flex',
		gap: 8,
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
