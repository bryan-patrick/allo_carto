import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckPassageView from '@/src/components/DeckPassageView';
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
import {
	Animated,
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Images
 */
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

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
	const { bottom, top } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const { id: userId } = useUserContext() ?? {};
	const { cardDeckDispatch } = useCardDeck();
	const [loadingPassageDeckId, setLoadingPassageDeckId] = useState<string>();
	const [passageState, setPassageState] = useState<DeckPickerPassageState>();
	const [sheetProgress] = useState(() => new Animated.Value(0));

	/**
	 * Story display values
	 */
	const storyColor = story.color ?? colors.dark.primary;
	const collapsedSheetHeight = windowHeight * 0.6;
	const expandedSheetHeight = Math.max(collapsedSheetHeight, windowHeight - top - 8);
	const sheetHeight = sheetProgress.interpolate({
		inputRange: [0, 1],
		outputRange: [collapsedSheetHeight, expandedSheetHeight],
	});
	const pickerOpacity = sheetProgress.interpolate({
		inputRange: [0, 0.45, 1],
		outputRange: [1, 0, 0],
	});
	const passageOpacity = sheetProgress.interpolate({
		inputRange: [0, 0.55, 1],
		outputRange: [0, 0, 1],
	});
	const pickerTranslateY = sheetProgress.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -8],
	});
	const passageTranslateY = sheetProgress.interpolate({
		inputRange: [0, 1],
		outputRange: [8, 0],
	});

	/**
	 * Animate between the deck list and passage
	 */
	function animateSheet(toValue: number, onComplete?: () => void) {
		Animated.timing(sheetProgress, {
			toValue,
			duration: 280,
			useNativeDriver: false,
		}).start(({ finished }) => {
			if (finished) onComplete?.();
		});
	}

	/**
	 * Close the picker and clear its passage state
	 */
	function handleClose() {
		sheetProgress.stopAnimation();
		sheetProgress.setValue(0);
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
			requestAnimationFrame(() => animateSheet(1));
		} catch (error) {
			console.error('Could not retrieve passage progress:', error);
		} finally {
			setLoadingPassageDeckId(undefined);
		}
	}

	/**
	 * Return to the deck list
	 */
	function handleBackToDecks() {
		animateSheet(0, () => setPassageState(undefined));
	}

	/**
	 * Back out of the passage before closing the deck picker
	 */
	function handleModalRequestClose() {
		if (passageState) {
			handleBackToDecks();
			return;
		}

		handleClose();
	}

	/**
	 * Render the deck picker and passage view
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
				<Animated.View
					style={[
						styles.sheet,
						{
							height: sheetHeight,
							paddingBottom: Math.max(bottom, 16),
						},
					]}
				>
					<ImageBackground
						imageStyle={styles.backgroundImage}
						resizeMode="cover"
						source={postcardBackground}
						style={StyleSheet.absoluteFill}
					/>

					<View style={styles.topBar}>
						{passageState ?
							<Pressable
								accessibilityLabel="Back to decks"
								accessibilityRole="button"
								hitSlop={12}
								onPress={handleBackToDecks}
								style={styles.topBarButton}
							>
								<MaterialSymbol
									color={colors.dark.text}
									name="arrow_back"
									size={22}
								/>
							</Pressable>
						:	<View style={styles.topBarButton} />}
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
							style={styles.topBarButton}
						>
							<MaterialSymbol
								color={colors.dark.text}
								name="close"
								size={22}
							/>
						</Pressable>
					</View>

					<View style={styles.content}>
						<Animated.View
							accessibilityElementsHidden={Boolean(passageState)}
							importantForAccessibility={passageState ? 'no-hide-descendants' : 'auto'}
							pointerEvents={passageState ? 'none' : 'auto'}
							style={[
								styles.contentLayer,
								styles.pickerContent,
								{
									opacity: pickerOpacity,
									transform: [{ translateY: pickerTranslateY }],
								},
							]}
						>
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
						</Animated.View>

						{passageState && (
							<Animated.View
								accessibilityElementsHidden={!passageState}
								importantForAccessibility={passageState ? 'auto' : 'no-hide-descendants'}
								pointerEvents={passageState ? 'auto' : 'none'}
								style={[
									styles.contentLayer,
									{
										opacity: passageOpacity,
										transform: [{ translateY: passageTranslateY }],
									},
								]}
							>
								<DeckPassageView
									deck={passageState.deck}
									wordProgressCounts={passageState.wordProgressCounts}
									wordProgressKeyByWordId={passageState.wordProgressKeyByWordId}
								/>
							</Animated.View>
						)}
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(18, 18, 18, 0.8)',
	},
	sheet: {
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		paddingTop: 8,
		overflow: 'hidden',
	},
	backgroundImage: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	topBar: {
		alignItems: 'center',
		flexDirection: 'row',
		minHeight: 36,
		paddingHorizontal: 16,
	},
	indicatorContainer: {
		flex: 1,
	},
	topBarButton: {
		alignItems: 'center',
		height: 36,
		justifyContent: 'center',
		width: 36,
	},
	content: {
		position: 'relative',
		minHeight: 0,
		flex: 1,
	},
	contentLayer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
	},
	pickerContent: {
		paddingHorizontal: 16,
	},
	header: {
		paddingBottom: 12,
		paddingHorizontal: 4,
		paddingTop: 8,
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
	},
	chapterLabel: {
		fontFamily: 'lexend-700',
		fontSize: 11,
		marginBottom: 2,
		textTransform: 'uppercase',
	},
	chapterTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-700',
		fontSize: 22,
		lineHeight: 24,
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
		borderLeftWidth: 4,
		borderBottomLeftRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		marginVertical: 4,

		gap: 12,
	},
	deckTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
		lineHeight: 22,
	},
	deckDescription: {
		color: colors.dark.primaryActive,
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 13,
		marginTop: 4,
	},
	metadata: {
		alignItems: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 8,
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
