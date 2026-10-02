import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import LinkButton from '@/src/components/LinkButton';
import LockedSection from '@/src/components/LockedSection';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import ViewIndicator from '@/src/components/ViewIndicator';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Typing
 */
interface DeckPickerModalProps {
	chapter: DeckChapter;
	onRequestClose: () => void;
	progressById: ProgressById;
	story: DeckStory;
	visible: boolean;
}

interface MetadataItemProps {
	color: string;
	icon: string;
	text: string;
}

interface DeckPickerPassageState {
	deck: CardDeck;
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

/**
 * DeckPickerModal component
 */
export default function DeckPickerModal({
	chapter,
	onRequestClose,
	progressById,
	story,
	visible,
}: DeckPickerModalProps) {
	/**
	 * Context and state
	 */
	const { bottom } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const { cardDeckDispatch } = useCardDeck();
	const [loadingPassageDeckId, setLoadingPassageDeckId] = useState<string>();
	const [passageState, setPassageState] = useState<DeckPickerPassageState>();

	/**
	 * Story display values
	 */
	const storyColor = story.color ?? colors.dark.primary;

	/**
	 * Close the picker and clear its passage state
	 */
	function handleClose() {
		setPassageState(undefined);
		onRequestClose();
	}

	/**
	 * Load and begin the selected deck
	 */
	async function handleSelectDeck(deck: CardDeck) {
		if (!userId) return;

		const selectedDeck = await getDeck({ deck, userId });

		if (!selectedDeck) return;

		cardDeckDispatch({ type: 'SET_DECK', payload: selectedDeck });
		handleClose();
		router.push('/CardDeck');
	}

	/**
	 * Load passage progress before opening the passage view
	 */
	async function handleShowPassage(deck: CardDeck) {
		if (!userId || loadingPassageDeckId) return;

		setLoadingPassageDeckId(deck.id);

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
			setLoadingPassageDeckId(undefined);
		}
	}

	/**
	 * Back out of the passage before closing the deck picker
	 */
	function handleModalRequestClose() {
		if (passageState) {
			setPassageState(undefined);
			return;
		}

		handleClose();
	}

	/**
	 * Render the deck picker or its passage view
	 */
	return (
		<Modal
			accessibilityViewIsModal
			animationType="slide"
			onRequestClose={handleModalRequestClose}
			presentationStyle="overFullScreen"
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.backdrop}>
				{passageState ?
					<View style={styles.passageSurface}>
						<DeckBoxModal
							deck={passageState.deck}
							dismissLabel="Back to decks"
							embedded
							modalVisible
							setModalVisible={nextVisible => {
								if (!nextVisible) setPassageState(undefined);
							}}
							wordProgressCounts={passageState.wordProgressCounts}
							wordProgressKeyByWordId={passageState.wordProgressKeyByWordId}
						/>
					</View>
				:	<View style={[styles.sheet, { paddingBottom: Math.max(bottom, 16) }]}>
						<View style={styles.topBar}>
							<View style={styles.indicatorContainer}>
								<ViewIndicator
									activeColor={storyColor}
									currentViewIndex={2}
									inactiveColor={colors.light.border}
									respectSafeArea={false}
									showTextShadow={false}
									views={['Story', 'Chapter', 'Deck']}
								/>
							</View>
							<Pressable
								accessibilityLabel="Close deck selection"
								accessibilityRole="button"
								hitSlop={12}
								onPress={handleClose}
								style={styles.closeButton}
							>
								<MaterialSymbol
									color={colors.dark.text}
									name="close"
									size={22}
								/>
							</Pressable>
						</View>

						<View style={styles.header}>
							<Text style={[styles.chapterLabel, { color: storyColor }]}>{chapter.label}</Text>
							<Text style={styles.chapterTitle}>{chapter.name}</Text>
							<Text style={styles.modalDescription}>Choose a deck</Text>
						</View>

						<ScrollView
							contentContainerStyle={styles.deckList}
							showsVerticalScrollIndicator
						>
							{
								/**
								 * Map the chapter's decks
								 */
								chapter.decks.map(deck => {
									const isLocked = !isItemUnlocked({ id: deck.id, progressById });
									const completionPercent = Math.floor(
										progressById[deck.id]?.completionPercentage ?? 0,
									);
									const actionLabel = completionPercent > 0 ? 'Continue' : 'Review';
									const isLoadingPassage = loadingPassageDeckId === deck.id;

									return (
										<View
											key={deck.id}
											style={[
												styles.deckRow,
												{
													borderLeftColor: isLocked ? storyColor : deck.colors.dark.primary,
												},
											]}
										>
											{!isLocked && (
												<View>
													<Text style={styles.deckTitle}>{deck.title}</Text>
													<Text style={styles.deckDescription}>{deck.description}</Text>
													<View
														accessible
														accessibilityLabel={`${deck.CEFR.join(' to ')}, ${deck.wordIds.length} cards, ${completionPercent} percent known`}
														style={styles.metadata}
													>
														<MetadataItem
															color={storyColor}
															icon="globe"
															text={deck.CEFR.join('–')}
														/>
														<View style={styles.metadataDivider} />
														<MetadataItem
															color={storyColor}
															icon="cards_star"
															text={`${deck.wordIds.length} cards`}
														/>
														<View style={styles.metadataDivider} />
														<MetadataItem
															color={storyColor}
															icon="cognition_2"
															text={`${completionPercent}% known`}
														/>
													</View>
												</View>
											)}

											{isLocked ?
												<LockedSection
													color={storyColor}
													unlockCriteria={getUnlockCriteria(deck, progressById)}
												/>
											:	<View style={styles.actions}>
													<LinkButton
														accessibilityLabel={`Read passage: ${deck.title}`}
														color={storyColor}
														contentPaddingHorizontal={8}
														contentPaddingVertical={7}
														disabled={Boolean(loadingPassageDeckId)}
														handler={() => handleShowPassage(deck)}
														showInnerBorder={false}
														showShadow={false}
														style={[
															styles.actionButton,
															styles.secondaryActionButton,
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
														{isLoadingPassage ? 'Loading…' : 'Read passage'}
													</LinkButton>
													<LinkButton
														accessibilityLabel={`${actionLabel} deck: ${deck.title}`}
														arrowColor={colors.light.text}
														color={storyColor}
														contentPaddingHorizontal={8}
														contentPaddingVertical={7}
														handler={() => handleSelectDeck(deck)}
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
											}
										</View>
									);
								})
							}
						</ScrollView>
					</View>
				}
			</View>
		</Modal>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	backdrop: {
		backgroundColor: 'rgba(18, 18, 18, 0.72)',
		flex: 1,
		justifyContent: 'flex-end',
	},
	passageSurface: {
		flex: 1,
		width: '100%',
	},
	sheet: {
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		height: '60%',
		overflow: 'hidden',
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	topBar: {
		alignItems: 'center',
		flexDirection: 'row',
		minHeight: 32,
	},
	indicatorContainer: {
		flex: 1,
		paddingLeft: 36,
	},
	closeButton: {
		height: 36,
		width: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	header: {
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 1,
		paddingBottom: 14,
		paddingHorizontal: 4,
		paddingTop: 8,
	},
	chapterLabel: {
		fontFamily: 'lexend-700',
		fontSize: 11,
		marginBottom: 2,
		textTransform: 'uppercase',
	},
	chapterTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 24,
		lineHeight: 30,
	},
	modalDescription: {
		color: colors.dark.primaryActive,
		fontFamily: 'lexend-400',
		fontSize: 14,
		marginTop: 2,
	},
	deckList: {
		paddingBottom: 8,
	},
	deckRow: {
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 1,
		borderLeftWidth: 3,
		paddingHorizontal: 12,
		paddingVertical: 16,
		gap: 12,
	},
	deckTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 17,
		lineHeight: 22,
	},
	deckDescription: {
		color: colors.dark.primaryActive,
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 18,
		marginTop: 2,
	},
	metadata: {
		alignItems: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 7,
		marginTop: 9,
	},
	metadataItem: {
		alignItems: 'center',
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
		height: 12,
		width: 1,
	},
	actions: {
		flexDirection: 'row',
		gap: 10,
	},
	actionButton: {
		flex: 1,
	},
	secondaryActionButton: {
		borderWidth: 1,
	},
	primaryActionButton: {
		borderWidth: 1,
	},
	loadingButton: {
		opacity: 0.5,
	},
});
