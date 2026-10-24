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
import ProgressBar from '@/src/components/ProgressBar';
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
import { formatCEFRRange } from '@/src/util/formatCEFRRange';
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

interface MetadataItemProps {
	color: string;
	icon: string;
	text: string;
}

interface ProgressMetadataProps extends MetadataItemProps {
	percent: number;
}

interface PassageState {
	deck: ReadingPassage;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * Helper components
 */
function MetadataItem({ color, icon, text }: MetadataItemProps) {
	return (
		<View style={styles.metadataItem}>
			<MaterialSymbol
				color={color}
				name={icon}
				size={16}
			/>
			<Text style={styles.metadataText}>{text}</Text>
		</View>
	);
}

function ProgressMetadata({ color, icon, text, percent }: ProgressMetadataProps) {
	return (
		<View style={styles.completionMetadata}>
			<MetadataItem
				color={color}
				icon={icon}
				text={text}
			/>
			<ProgressBar
				color={color}
				percent={percent}
				style={styles.progressBarContainer}
			/>
		</View>
	);
}

/**
 * The chapter's decks and their passage preview
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
				Alert.alert('Could not start deck', 'Please try again.');
				return;
			}

			cardDeckDispatch({
				type: 'SET_DECK',
				payload: selectedDeck,
				session: createDeckSession(experience.totalXP, progressById),
			});
			router.push('/CardDeck');
		} catch (error) {
			console.error('Could not start deck:', error);
			Alert.alert('Could not start deck', 'Please try again.');
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
	 * Render the existing deck rows inside the chapter postcard
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
				const seenPercent = Math.floor(progressById[deck.id]?.seenPercentage ?? 0);
				const seenWordCount = progressById[deck.id]?.seenWordCount ?? 0;
				const wordCount = progressById[deck.id]?.wordCount ?? new Set(deck.wordIds).size;
				const seenText = `${seenWordCount}/${wordCount} words seen`;
				const learnedText = `${completionPercent}% learned`;
				const deckLevelText = formatCEFRRange(deck.CEFR);
				const metadataAccessibilityLabel = `${formatCEFRRange(deck.CEFR, ' to ')}, ${seenWordCount} of ${wordCount} words seen, ${completionPercent} percent learned`;
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
								title={deck.title}
								progress={progressById[deck.id]}
							>
								<View
									accessible
									accessibilityLabel={metadataAccessibilityLabel}
									style={styles.metadata}
								>
									<MetadataItem
										color={storyColor}
										icon="globe"
										text={deckLevelText}
									/>
									<View style={styles.metadataDivider} />
									<ProgressMetadata
										color={storyColor}
										icon="cards_star"
										text={seenText}
										percent={seenPercent}
									/>
									<View style={styles.metadataDivider} />
									<ProgressMetadata
										color={storyColor}
										icon="cognition_2"
										text={learnedText}
										percent={completionPercent}
									/>
								</View>
							</DeckHeader>
						)}

						{isLocked && (
							<LockedSection
								itemId={deck.id}
								color={storyColor}
								unlockCriteria={unlockCriteria}
							/>
						)}
						{!isLocked && (
							<View style={styles.actions}>
								<LinkButton
									accessibilityLabel={`Read passage: ${deck.title}`}
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
									accessibilityLabel={`${actionLabel} deck: ${deck.title}`}
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
	metadata: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 8,
		gap: 6,
	},
	metadataItem: {
		alignItems: 'center',
		alignContent: 'center',
		flexDirection: 'row',
		gap: 4,
	},
	metadataText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	metadataDivider: {
		backgroundColor: colors.light.border,
		height: 22,
		width: 1,
	},
	completionMetadata: {
		gap: 1,
	},
	progressBarContainer: {
		backgroundColor: '#00000012',
		borderColor: colors.light.border,
		borderRadius: 4,
		borderWidth: 1,
		height: 4,
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
