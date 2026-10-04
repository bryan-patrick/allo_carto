import colors from '@/src/app/colors';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import Loader from '@/src/components/Loader';
import CardDeckView from '@/src/components/Views/CardDeckView';
import { getDB, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import getOtherWordForms from '@/src/db/queries/getOtherWordForms';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import formatOtherWordForm from '@/src/util/formatOtherWordForm';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface PassageProgress {
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * Deck view - A route wrapper in (routes)
 */
export default function CardDeck() {
	const { cardDeckState, currentCard } = useCardDeck();
	const { cardDeck } = cardDeckState;
	const { id: userId } = useUserContext() ?? {};
	const { isUpdatingProgress, progressById, status } = useUserProgress();
	const isOpeningWordDetails = useRef(false);
	const [isPassageVisible, setIsPassageVisible] = useState(false);
	const [passageProgress, setPassageProgress] = useState<PassageProgress>();
	const isLocked = !isItemUnlocked({
		id: cardDeck.id,
		progressById,
	});
	const isPassageDisabled = !userId || isUpdatingProgress;

	/**
	 * Refresh passage progress without changing the current flashcard.
	 */
	async function handleShowPassage() {
		if (!userId || isPassageDisabled || isOpeningWordDetails.current) return;

		isOpeningWordDetails.current = true;

		try {
			const database = await getDB();
			const [wordProgressCounts, wordProgressKeyByWordId] = await Promise.all([
				getDeckWordProgressCounts({ database, userId, wordIds: cardDeck.wordIds }),
				getWordProgressById({ userId, passage: cardDeck.passage }),
			]);

			setPassageProgress({ wordProgressCounts, wordProgressKeyByWordId });
			setIsPassageVisible(true);
		} catch (error) {
			console.error('Could not retrieve passage progress:', error);
			Alert.alert('Could not load passage', 'Please try again.');
		} finally {
			isOpeningWordDetails.current = false;
		}
	}

	/**
	 * Show the other forms already available in the word library.
	 */
	async function handleShowOtherForms() {
		if (isOpeningWordDetails.current) return;

		isOpeningWordDetails.current = true;

		try {
			const forms = await getOtherWordForms(currentCard);
			const message = forms.map(formatOtherWordForm).join('\n');

			Alert.alert(
				`Other forms of ${currentCard.frenchWord}`,
				message || 'No other forms are available for this word yet.',
			);
		} catch (error) {
			console.error('Could not retrieve other forms:', error);
			Alert.alert('Could not load other forms', 'Please try again.');
		} finally {
			isOpeningWordDetails.current = false;
		}
	}

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load deck progress.</Text>;

	/**
	 * Block locked decks
	 */
	if (isLocked) {
		return <Text>This deck is locked.</Text>;
	}

	/**
	 * Render the deck
	 */
	return (
		<>
			<Stack.Screen options={{ headerRight: () => null }} />
			<CardDeckView
				currentCard={currentCard}
				wordActions={
					<View style={styles.wordLinksRow}>
						<Pressable
							accessibilityLabel="View word in passage"
							accessibilityRole="button"
							accessibilityState={{ disabled: isPassageDisabled }}
							disabled={isPassageDisabled}
							hitSlop={8}
							onPress={handleShowPassage}
							style={styles.wordLink}
						>
							<Text style={styles.wordLinkText}>View passage</Text>
						</Pressable>
						<View
							accessible={false}
							style={styles.wordLinksDivider}
						/>
						<Pressable
							accessibilityLabel="Other forms of this word"
							accessibilityRole="button"
							hitSlop={8}
							onPress={handleShowOtherForms}
							style={styles.wordLink}
						>
							<Text style={styles.wordLinkText}>Other forms</Text>
						</Pressable>
					</View>
				}
			/>
			{passageProgress && (
				<DeckBoxModal
					currentWordId={currentCard.id}
					deck={cardDeck}
					modalVisible={isPassageVisible}
					setModalVisible={setIsPassageVisible}
					wordProgressCounts={passageProgress.wordProgressCounts}
					wordProgressKeyByWordId={passageProgress.wordProgressKeyByWordId}
				/>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	wordLinksRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 12,
	},
	wordLinksDivider: {
		borderLeftColor: colors.light.border,
		borderLeftWidth: 1,
		height: 14,
	},
	wordLink: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	wordLinkText: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textDecorationLine: 'underline',
		textShadowColor: '#00000055',
		textShadowRadius: 1,
		textShadowOffset: { width: 0, height: 0 },
	},
});
