import colors from '@/src/app/colors';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import Loader from '@/src/components/Loader';
import CardDeckView from '@/src/components/Views/CardDeckView';
import { getDB, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

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
	const [isLoadingPassage, setIsLoadingPassage] = useState(false);
	const [isPassageVisible, setIsPassageVisible] = useState(false);
	const [passageProgress, setPassageProgress] = useState<PassageProgress>();
	const isLocked = !isItemUnlocked({
		id: cardDeck.id,
		progressById,
	});
	const isPassageDisabled = !userId || isLoadingPassage || isUpdatingProgress;

	/**
	 * Refresh passage progress without changing the current flashcard.
	 */
	async function handleShowPassage() {
		if (!userId || isPassageDisabled) return;

		setIsLoadingPassage(true);

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
			setIsLoadingPassage(false);
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
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							accessibilityLabel="Read passage"
							accessibilityRole="button"
							accessibilityState={{ busy: isLoadingPassage, disabled: isPassageDisabled }}
							disabled={isPassageDisabled}
							onPress={handleShowPassage}
							style={({ pressed }) => [
								styles.passageButton,
								(pressed || isPassageDisabled) && styles.passageButtonDimmed,
							]}
						>
							<Text style={styles.passageButtonText}>
								{isLoadingPassage ? 'Loading…' : 'Passage'}
							</Text>
						</Pressable>
					),
				}}
			/>
			<CardDeckView currentCard={currentCard} />
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
	passageButton: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 44,
		paddingHorizontal: 8,
	},
	passageButtonDimmed: {
		opacity: 0.5,
	},
	passageButtonText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
});
