import colors from '@/src/app/colors';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import Loader from '@/src/components/Loader';
import CardDeckView from '@/src/components/Views/CardDeckView';
import { sharedWordCardStyles } from '@/src/components/WordCard/sharedWordCardStyles';
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
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface PassageProgress {
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

interface OtherFormsAvailability {
	wordId: string;
	lemmaId?: string;
	hasOtherForms?: boolean;
}

/**
 * Deck view - A route wrapper in (routes)
 */
export default function CardDeck() {
	const { cardDeckState, currentCard } = useCardDeck();
	const { cardDeck } = cardDeckState;
	const { id: userId } = useUserContext() ?? {};
	const { experience, isUpdatingProgress, progressById, status } = useUserProgress();
	const isOpeningWordDetails = useRef(false);
	const [isPassageVisible, setIsPassageVisible] = useState(false);
	const [passageProgress, setPassageProgress] = useState<PassageProgress>();
	const [otherFormsAvailability, setOtherFormsAvailability] = useState<OtherFormsAvailability>();
	const { id: currentWordId, lemmaId: currentLemmaId } = currentCard;
	const isLocked = !isItemUnlocked({
		id: cardDeck.id,
		progressById,
		userLevel: experience.level,
	});
	const isPassageDisabled = !userId || isUpdatingProgress;
	const shouldShowOtherForms =
		otherFormsAvailability?.wordId === currentWordId &&
		otherFormsAvailability?.lemmaId === currentLemmaId &&
		otherFormsAvailability?.hasOtherForms === true;

	/**
	 * Check availability for the current word and ignore stale requests.
	 */
	useEffect(() => {
		let isCancelled = false;

		async function loadOtherFormsAvailability() {
			let hasOtherForms: boolean | undefined;

			try {
				const forms = await getOtherWordForms({ id: currentWordId, lemmaId: currentLemmaId });
				hasOtherForms = forms.length > 0;
			} catch (error) {
				console.error('Could not check other forms:', error);
			}

			if (isCancelled) return;

			setOtherFormsAvailability({
				wordId: currentWordId,
				lemmaId: currentLemmaId,
				hasOtherForms,
			});
		}

		loadOtherFormsAvailability();

		return () => {
			isCancelled = true;
		};
	}, [currentWordId, currentLemmaId]);

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
		if (!shouldShowOtherForms || isOpeningWordDetails.current) return;

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
			<CardDeckView
				currentCard={currentCard}
				wordActions={
					<View style={sharedWordCardStyles.wordMetaContainer}>
						<Pressable
							accessibilityLabel="View word in passage"
							accessibilityRole="button"
							accessibilityState={{ disabled: isPassageDisabled }}
							disabled={isPassageDisabled}
							hitSlop={8}
							onPress={handleShowPassage}
							style={styles.wordLink}
						>
							<Text style={[sharedWordCardStyles.wordDetailText, styles.wordLinkText]}>
								View passage
							</Text>
						</Pressable>
						{shouldShowOtherForms && (
							<>
								<View
									accessible={false}
									style={sharedWordCardStyles.wordDetailDivider}
								/>
								<Pressable
									accessibilityLabel="Other forms of this word"
									accessibilityRole="button"
									hitSlop={8}
									onPress={handleShowOtherForms}
									style={styles.wordLink}
								>
									<Text style={[sharedWordCardStyles.wordDetailText, styles.wordLinkText]}>
										Other forms
									</Text>
								</Pressable>
							</>
						)}
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

/**
 * Styles
 */
const styles = StyleSheet.create({
	wordLink: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	wordLinkText: {
		lineHeight: 16,
		color: colors.dark.primary,
		textDecorationLine: 'underline',
		textShadowColor: '#00000055',
		textShadowRadius: 1,
		textShadowOffset: { width: 0, height: 0 },
	},
});
