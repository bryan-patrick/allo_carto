import { getTipById } from '@/data/french/tips';
import colors from '@/src/app/colors';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import LevelBadge from '@/src/components/LevelBadge';
import Loader from '@/src/components/Loader';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import CardDeckView from '@/src/components/Views/CardDeckView';
import DeckPreviewView from '@/src/components/Views/DeckPreviewView';
import ElisionModal from '@/src/components/WordCard/ElisionModal';
import WordTipModal from '@/src/components/WordCard/WordTipModal';
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
import { useSoftTapSound } from '@/src/util/softTapSound';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { Stack, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
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
	const navigation = useNavigation();
	const playSoftTap = useSoftTapSound();
	const { cardDeckState, currentCard } = useCardDeck();
	const { cardDeck } = cardDeckState;
	const { id: userId } = useUserContext() ?? {};
	const { isUpdatingProgress, progressById, status } = useUserProgress();
	const isOpeningWordDetails = useRef(false);

	const [isDeckPreviewVisible, setIsDeckPreviewVisible] = useState(
		Boolean(cardDeckState.session && cardDeckState.session.results.length === 0),
	);

	const [isPassageVisible, setIsPassageVisible] = useState(false);
	const [isElisionVisible, setIsElisionVisible] = useState(false);
	const [isWordTipVisible, setIsWordTipVisible] = useState(false);
	const [passageProgress, setPassageProgress] = useState<PassageProgress>();
	const [otherFormsAvailability, setOtherFormsAvailability] = useState<OtherFormsAvailability>();
	const { id: currentWordId, lemmaId: currentLemmaId } = currentCard;
	const currentTip = getTipById(currentCard.tipId ?? '');

	const isLocked = !isItemUnlocked({
		id: cardDeck.id,
		progressById,
	});

	const isPassageDisabled = !userId || isUpdatingProgress;

	/**
	 * Show the elision link when the French article or word contains an apostrophe.
	 */
	const frenchWordWithArticle = `${currentCard.frenchArticle ?? ''}${currentCard.frenchWord}`;
	const shouldShowElision = /['’ʼ]/u.test(frenchWordWithArticle);

	const shouldShowOtherForms =
		otherFormsAvailability?.wordId === currentWordId &&
		otherFormsAvailability?.lemmaId === currentLemmaId &&
		otherFormsAvailability?.hasOtherForms === true;

	// Play the tap sound and keep the native Back button's usual navigation.
	function handleBack() {
		void playSoftTap();
		navigation.goBack();
	}

	// Open the first flashcard after the player finishes reading the deck preview.
	function handleStartFlashcards() {
		setIsDeckPreviewVisible(false);
	}

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
	if (status === 'error') return <Text>Could not load paragraph progress.</Text>;

	/**
	 * Block locked decks
	 */
	if (isLocked) {
		return <Text style={{ textAlign: 'center' }}>This paragraph is locked.</Text>;
	}

	/**
	 * Render the deck
	 */
	return (
		<>
			<Stack.Screen
				options={{
					headerRight: () => <LevelBadge onPress={playSoftTap} />,
					unstable_headerRightItems: () => [
						{
							type: 'custom',
							element: <LevelBadge onPress={playSoftTap} />,
							hidesSharedBackground: true,
						},
					],
					unstable_nativeProps: {
						onHeaderBackButtonClicked: handleBack,
					},
				}}
			/>
			{isDeckPreviewVisible ?
				<DeckPreviewView
					deck={cardDeck}
					isReadDisabled={isPassageDisabled}
					onRead={handleShowPassage}
					onStart={handleStartFlashcards}
				/>
			:	<CardDeckView
					currentCard={currentCard}
					wordActions={
						<View style={sharedWordCardStyles.wordMetaContainer}>
							<Pressable
								accessibilityLabel="Read paragraph"
								accessibilityRole="button"
								accessibilityState={{
									disabled: isPassageDisabled,
								}}
								disabled={isPassageDisabled}
								hitSlop={8}
								onPress={handleShowPassage}
								style={styles.wordLink}
							>
								<Text style={[sharedWordCardStyles.wordDetailText, styles.wordLinkText]}>Read</Text>
								<MaterialSymbol
									name="menu_book"
									size={16}
									color={colors.dark.primary}
								/>
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
										<MaterialSymbol
											name="language"
											size={16}
											color={colors.dark.primary}
										/>
									</Pressable>
								</>
							)}
							{shouldShowElision && (
								<>
									<View
										accessible={false}
										style={sharedWordCardStyles.wordDetailDivider}
									/>
									<Pressable
										accessibilityLabel="Learn about elisions"
										accessibilityRole="button"
										hitSlop={8}
										onPress={() => setIsElisionVisible(true)}
										style={styles.wordLink}
									>
										<Text style={[sharedWordCardStyles.wordDetailText, styles.wordLinkText]}>
											Elision!
										</Text>
										<MaterialSymbol
											name="lightbulb_2"
											size={16}
											color={colors.dark.primary}
										/>
									</Pressable>
								</>
							)}
							{currentTip && (
								<>
									<View
										accessible={false}
										style={sharedWordCardStyles.wordDetailDivider}
									/>
									<Pressable
										accessibilityLabel="Read a tip about this word"
										accessibilityRole="button"
										hitSlop={8}
										onPress={() => setIsWordTipVisible(true)}
										style={styles.wordLink}
									>
										<Text style={[sharedWordCardStyles.wordDetailText, styles.wordLinkText]}>
											Tip!
										</Text>
										<MaterialSymbol
											name="lightbulb_2"
											size={16}
											color={colors.dark.primary}
										/>
									</Pressable>
								</>
							)}
						</View>
					}
				/>
			}
			{passageProgress && (
				<DeckBoxModal
					currentWordId={isDeckPreviewVisible ? undefined : currentCard.id}
					deck={cardDeck}
					modalVisible={isPassageVisible}
					setModalVisible={setIsPassageVisible}
					wordProgressCounts={passageProgress.wordProgressCounts}
					wordProgressKeyByWordId={passageProgress.wordProgressKeyByWordId}
				/>
			)}
			<ElisionModal
				visible={isElisionVisible && shouldShowElision}
				onClose={() => setIsElisionVisible(false)}
			/>
			{currentTip && (
				<WordTipModal
					key={currentCard.id}
					tip={currentTip}
					visible={isWordTipVisible}
					onClose={() => setIsWordTipVisible(false)}
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
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
