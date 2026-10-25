import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import type { CardDeck, ReadingPassage } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import ChapterHeader from '@/src/components/ChapterHeader';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import DeckHeader from '@/src/components/DeckHeader';
import LinkButton from '@/src/components/LinkButton';
import LockedSection from '@/src/components/LockedSection';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getCardsPerDeck } from '@/src/util/cardsPerDeck';
import { createDeckSession } from '@/src/util/createDeckSession';
import type { ProgressById } from '@/src/util/progression';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterDeckListProps {
	chapter: DeckChapter;
	progressById: ProgressById;
	story: DeckStory;
}

interface PassageState {
	deck: ReadingPassage;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * We use this to list a chapter's paragraphs and open their reading or flashcard view.
 */
export default function ChapterDeckList({ chapter, progressById, story }: ChapterDeckListProps) {
	const router = useRouter();
	/**
	 * Context and state
	 */
	const { id: userId } = useUserContext() ?? {};
	const { experience, isUpdatingProgress } = useUserProgress();
	const { settings } = useAppSettings();
	const userLevel = experience.level;
	const cardsPerDeck = getCardsPerDeck(userLevel, settings.cardsPerDeck);
	const { cardDeckDispatch } = useCardDeck();
	const isStartingDeck = useRef(false);
	const [loadingPassageId, setLoadingPassageId] = useState<string>();
	const [passageState, setPassageState] = useState<PassageState>();
	const storyColor = colors.category[story.category];

	/**
	 * Load and begin the selected deck
	 */
	async function handleSelectDeck(deck: CardDeck) {
		if (!userId || isUpdatingProgress || isStartingDeck.current) {
			return;
		}
		if (!isItemUnlocked({ id: deck.id, progressById, userLevel })) {
			return;
		}

		isStartingDeck.current = true;

		try {
			const selectedDeck = await getDeck({ deck, amount: cardsPerDeck, userId });

			if (!selectedDeck || selectedDeck.words.length === 0) {
				Alert.alert('Could not start session', 'Please try again.');
				return;
			}

			cardDeckDispatch({
				type: 'SET_DECK',
				payload: selectedDeck,
				session: createDeckSession(experience.totalXP, progressById),
			});
			router.push('/CardDeck');
		} catch (error) {
			console.error('Could not start session:', error);
			Alert.alert('Could not start session', 'Please try again.');
		} finally {
			isStartingDeck.current = false;
		}
	}

	/**
	 * Load passage progress before opening the passage view
	 */
	async function handleShowPassage(deck: ReadingPassage) {
		if (!userId || loadingPassageId) {
			return;
		}
		if (!isItemUnlocked({ id: deck.id, progressById, userLevel })) {
			return;
		}

		setLoadingPassageId(deck.id);

		try {
			const database = await getDB();
			const [wordProgressCounts, wordProgressKeyByWordId] = await Promise.all([
				getDeckWordProgressCounts({ database, userId, wordIds: deck.wordIds }),
				getWordProgressById({ userId, passage: deck.passage }),
			]);

			setPassageState({ deck, wordProgressCounts, wordProgressKeyByWordId });
		} catch (error) {
			console.error('Could not retrieve passage progress:', error);
		} finally {
			setLoadingPassageId(undefined);
		}
	}

	/**
	 * Show each paragraph with its number, title, gems, and reading and flashcard actions.
	 */
	return (
		<View style={styles.deckList}>
			<ChapterHeader
				chapter={chapter}
				color={storyColor}
			/>
			{chapter.decks.map((deck, index) => {
				const isFirstDeck = index === 0;
				const isLocked = !isItemUnlocked({ id: deck.id, progressById, userLevel });
				const completionPercent = Math.floor(progressById[deck.id]?.completionPercentage ?? 0);
				const unlockCriteria = getUnlockCriteria(deck, progressById, userLevel);
				const isLoadingPassage = loadingPassageId === deck.id;
				let actionLabel = 'Flash Cards';

				if (completionPercent > 0) {
					actionLabel = 'Study Cards';
				}

				return (
					<View
						key={deck.id}
						style={[styles.deckRow, isFirstDeck && styles.firstDeckRow]}
					>
						{!isLocked && (
							<DeckHeader
								subtitle={`Paragraph ${index + 1}`}
								title={deck.title}
								progress={progressById[deck.id]}
							/>
						)}

						{isLocked && (
							<>
								<Text style={styles.paragraphLabel}>{`Paragraph ${index + 1}`}</Text>
								<LockedSection
									itemId={deck.id}
									color={storyColor}
									unlockCriteria={unlockCriteria}
								/>
							</>
						)}
						{!isLocked && (
							<View style={styles.actions}>
								<LinkButton
									accessibilityLabel={`Read paragraph: ${deck.title}`}
									color={storyColor}
									contentPaddingHorizontal={4}
									contentPaddingVertical={4}
									disabled={Boolean(loadingPassageId)}
									handler={() => handleShowPassage(deck)}
									showInnerBorder={false}
									showShadow={false}
									style={[
										styles.actionButton,
										styles.secondaryButton,
										isLoadingPassage && styles.loadingButton,
									]}
									type="outline"
									useArrow={false}
									SVGElement={
										<MaterialSymbol
											color={storyColor}
											name="menu_book"
											size={18}
										/>
									}
								>
									Read
								</LinkButton>
								<LinkButton
									accessibilityLabel={`${actionLabel} for paragraph: ${deck.title}`}
									arrowColor={colors.light.text}
									color={storyColor}
									contentPaddingHorizontal={8}
									contentPaddingVertical={4}
									handler={() => handleSelectDeck(deck)}
									disabled={isUpdatingProgress}
									showInnerBorder={false}
									style={[
										styles.actionButton,
										styles.primaryActionButton,
										{ borderColor: storyColor },
									]}
								>
									{actionLabel}
								</LinkButton>
							</View>
						)}
					</View>
				);
			})}
			{passageState && (
				<DeckBoxModal
					deck={passageState.deck}
					modalVisible={Boolean(passageState)}
					setModalVisible={() => setPassageState(undefined)}
					wordProgressCounts={passageState.wordProgressCounts}
					wordProgressKeyByWordId={passageState.wordProgressKeyByWordId}
				/>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	deckList: {},
	deckRow: {
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		paddingHorizontal: 12,
		paddingVertical: 16,
		marginLeft: 8,
		gap: 8,
	},
	firstDeckRow: {
		borderTopLeftRadius: 8,
	},
	paragraphLabel: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
	actions: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		flex: 1,
	},
	secondaryButton: {
		flex: 1,
		borderWidth: 1,
		borderBottomWidth: 2,
	},
	primaryActionButton: {
		flex: 2,
		borderWidth: 1,
		borderBottomWidth: 2,
		shadowOpacity: 0,
	},
	loadingButton: {
		opacity: 0.5,
	},
});
