import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import LinkButton from '@/src/components/LinkButton';
import LockedSection from '@/src/components/LockedSection';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	emptyDeckWordProgressCounts,
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { findAtlasLocationByChapterId, type UnlockCriteria } from '@/src/util/atlasCompletion';
import { getDeckCompletionPercent } from '@/src/util/deckCompletion';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Animated, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import DeckBoxModal from './DeckBoxModal';

/**
 * Images
 */
const deckBoxTopImage = require('@/src/app/assets/images/decks/deck-box-top.png');
const deckBoxTopMaskImage = require('@/src/app/assets/images/decks/deck-box-top-mask.png');
const deckBoxLeftBorderImage = require('@/src/app/assets/images/decks/deck-box-border-left.png');
const deckBoxRightBorderImage = require('@/src/app/assets/images/decks/deck-box-border-right.png');
const deckBoxBottomImage = require('@/src/app/assets/images/decks/deck-box-border-bottom.png');
const deckBoxBg = require('@/src/app/assets/images/decks/deck-box-bg.jpg');

/**
 * Typing
 */
interface DeckBoxProps {
	deck: CardDeck;
	isLocked: boolean;
	chapterId?: string;
	unlockCriteria: UnlockCriteria[];
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck, isLocked, chapterId, unlockCriteria }: DeckBoxProps) {
	/**
	 * Destructure deck
	 */
	const { CEFR, description: deckDescription, passage, title: deckTitle, wordIds } = deck;

	/**
	 * Context and state
	 */
	const { id: userId } = useUserContext() ?? {};
	const { cardDeckDispatch } = useCardDeck();
	const [wordProgressCounts, setWordProgressCounts] = useState<DeckWordProgressCounts>(
		emptyDeckWordProgressCounts,
	);
	const [wordProgressKeyByWordId, setWordProgressKeyByWordId] = useState<
		Record<string, WordProgressKey>
	>({});
	const [isPassageModalVisible, setIsPassageModalVisible] = useState(false);
	const [passageChevronTranslateY] = useState(() => new Animated.Value(0));

	/**
	 * Destructure atlas location and story
	 */
	const { story } = findAtlasLocationByChapterId(chapterId) ?? {};
	const { color: storyColor = colors.dark.primary } = story ?? {};

	/**
	 * Deck metadata
	 */
	const deckCardCount = wordIds.length;
	const deckCEFRLabel = CEFR.join(' - ');
	const deckCompletionPercent = getDeckCompletionPercent({
		deckWordCount: deckCardCount,
		wordProgressCounts,
	});
	const selectAction = deckCompletionPercent > 0 ? 'Continue' : 'Review';
	const selectText = `${selectAction} deck`;
	const deckMetadata = {
		cardCount: deckCardCount,
		CEFRLabel: deckCEFRLabel,
		completionPercent: deckCompletionPercent,
	};

	/**
	 * Data loaders
	 */
	const loadWordProgressCounts = useCallback(async () => {
		try {
			if (!userId) {
				setWordProgressCounts(emptyDeckWordProgressCounts);
				return;
			}

			const database = await getDB();
			const counts = await getDeckWordProgressCounts({
				database,
				userId,
				wordIds,
			});

			setWordProgressCounts(counts);
		} catch (error) {
			console.error('Could not retrieve deck word progress counts:', error);
		}
	}, [userId, wordIds]);

	const loadPassageWordProgress = useCallback(async () => {
		try {
			if (userId) {
				const passageWordProgressKeyByWordId = await getWordProgressById({
					userId,
					passage,
				});

				setWordProgressKeyByWordId(passageWordProgressKeyByWordId);
				return;
			}

			setWordProgressKeyByWordId({});
		} catch (error) {
			console.error('Could not retrieve passage word progress:', error);
		}
	}, [passage, userId]);

	/**
	 * The passage blips weren't updating when returning
	 * to the deck selection after completing a deck.
	 * This forces it.
	 */
	useFocusEffect(
		useCallback(() => {
			loadWordProgressCounts();
			loadPassageWordProgress();
		}, [loadPassageWordProgress, loadWordProgressCounts]),
	);

	/**
	 * Select deck handler
	 */
	const handleSelectDeck = useCallback(async () => {
		if (!userId) return;

		const selectedDeck = await getDeck({ deck, userId });

		if (!selectedDeck) return;

		cardDeckDispatch({ type: 'SET_DECK', payload: selectedDeck });
		router.push('/CardDeck');
	}, [userId, deck, cardDeckDispatch]);

	/**
	 * Refresh passage data and show modal
	 */
	async function handleShowPassage() {
		await Promise.all([loadWordProgressCounts(), loadPassageWordProgress()]);

		setIsPassageModalVisible(true);
	}

	/**
	 * Passage button animation handlers
	 */
	function handlePassageButtonPressIn() {
		Animated.timing(passageChevronTranslateY, {
			toValue: -3,
			duration: 90,
			useNativeDriver: true,
		}).start();
	}

	function handlePassageButtonPressOut() {
		Animated.timing(passageChevronTranslateY, {
			toValue: 0,
			duration: 140,
			useNativeDriver: true,
		}).start();
	}

	/**
	 * Render the Deck Box
	 */
	return (
		<>
			{!isLocked && (
				<DeckBoxModal
					deck={deck}
					modalVisible={isPassageModalVisible}
					setModalVisible={setIsPassageModalVisible}
					wordProgressCounts={wordProgressCounts}
					wordProgressKeyByWordId={wordProgressKeyByWordId}
				/>
			)}
			<View style={styles.deckBoxContainer}>
				<ImageBackground
					source={deckBoxTopImage}
					style={styles.deckBoxTop}
					resizeMode="stretch"
				>
					<ImageBackground
						source={deckBoxTopMaskImage}
						style={[styles.deckBoxTop, { zIndex: 1 }]}
						resizeMode="stretch"
					/>
				</ImageBackground>
				<View style={styles.deckBoxMiddle}>
					<ImageBackground
						source={deckBoxLeftBorderImage}
						style={styles.deckBoxLeftBorder}
						resizeMode="stretch"
					/>
					<ImageBackground
						source={deckBoxBg}
						style={styles.deckBoxContentBackground}
						resizeMode="stretch"
					>
						<View style={styles.deckBoxContentBorder}>
							{isLocked && (
								<View style={styles.lockedInner}>
									<LockedSection
										color={storyColor}
										unlockCriteria={unlockCriteria}
									/>
								</View>
							)}
							{!isLocked && (
								<View style={styles.deckDetails}>
									<View style={styles.titleContainer}>
										<Text style={styles.deckTitle}>{deckTitle}</Text>
										<Text style={styles.deckDescription}>{deckDescription}</Text>
									</View>
								</View>
							)}
							{!isLocked && (
								<View style={styles.deckInfoContainer}>
									<View style={[styles.deckInfoColumn, styles.deckInfoColumnSeparator]}>
										<MaterialSymbol
											name="globe"
											size={20}
											color={storyColor}
										/>
										<Text style={[styles.deckInfoText, { color: storyColor }]}>
											{deckMetadata.CEFRLabel}
										</Text>
									</View>
									<View style={[styles.deckInfoColumn, styles.deckInfoColumnSeparator]}>
										<MaterialSymbol
											name="cards_star"
											size={20}
											color={storyColor}
										/>
										<Text style={[styles.deckInfoText, { color: storyColor }]}>
											{deckMetadata.cardCount} Cards
										</Text>
									</View>
									<View style={styles.deckInfoColumn}>
										<MaterialSymbol
											name="cognition_2"
											size={20}
											color={storyColor}
										/>
										<Text style={[styles.deckInfoText, { color: storyColor }]}>
											{deckMetadata.completionPercent}% Known
										</Text>
									</View>
								</View>
							)}
							{!isLocked && (
								<View style={styles.selectDeckButtonContainer}>
									<Pressable
										onPress={handleShowPassage}
										onPressIn={handlePassageButtonPressIn}
										onPressOut={handlePassageButtonPressOut}
										style={[styles.passageButton, { borderColor: storyColor }]}
									>
										{/* <MaterialSymbol
											name="menu_book"
											size={20}
											color={storyColor}
										/> */}
										<Text style={[styles.passageButtonText, { color: storyColor }]}>
											Read passage
										</Text>
										<Animated.View
											style={{ transform: [{ translateY: passageChevronTranslateY }] }}
										>
											<MaterialSymbol
												name="keyboard_arrow_up"
												size={20}
												color={storyColor}
											/>
										</Animated.View>
									</Pressable>
									<LinkButton
										accessibilityHint={`${selectAction} practicing ${deckTitle}.`}
										accessibilityLabel={`${selectText}: ${deckTitle}`}
										arrowColor={colors.light.background}
										color={storyColor}
										handler={handleSelectDeck}
										fullwidth
									>
										<Text style={styles.selectDeckButtonText}>{selectText}</Text>
									</LinkButton>
								</View>
							)}
						</View>
					</ImageBackground>
					<ImageBackground
						source={deckBoxRightBorderImage}
						style={styles.deckBoxRightBorder}
						resizeMode="stretch"
					/>
				</View>
				<ImageBackground
					source={deckBoxBottomImage}
					style={styles.deckBoxBottom}
					resizeMode="stretch"
				/>
			</View>
		</>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	deckBoxContainer: {
		position: 'relative',
		marginHorizontal: 8,
		marginBottom: 4,
	},
	deckBoxTop: {
		width: '100%',
		aspectRatio: 761 / 94,
	},
	deckBoxMiddle: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: -24,
	},
	deckBoxLeftBorder: {
		flex: 22,
	},
	deckBoxContentBackground: {
		flex: 719,
	},
	deckBoxContentBorder: {
		margin: 8,
		marginTop: 4,
		borderWidth: 2,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
	},
	storyBadgeContainer: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		top: -4,
	},
	lockedInner: {
		paddingVertical: 24,
		paddingHorizontal: 16,
	},
	deckDetails: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		padding: 2,
		flex: 1,
		gap: 4,
	},
	titleContainer: {
		paddingTop: 12,
		paddingBottom: 12,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 6,
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
		width: '100%',
		gap: 4,
	},
	storyCategory: {
		fontFamily: 'lexend-700',
		color: colors.light.background,
		textTransform: 'uppercase',
		fontSize: 10,
	},
	deckTitleSeparator: {
		position: 'relative',
		borderTopWidth: 1,
		borderColor: colors.light.goldenBorder,
		marginVertical: 4,
		width: '50%',
	},
	deckTitleSeparatorDot: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		borderRadius: '50%',
		transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
		width: 8,
		height: 8,
		backgroundColor: colors.light.goldenBorder,
	},
	deckTitle: {
		fontFamily: 'lexend-600',
		fontSize: 18,
		lineHeight: 18,
		textAlign: 'center',
		color: colors.dark.text,
		marginTop: 12,
	},
	deckDescription: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 14,
		textAlign: 'center',
		color: colors.dark.text,
	},
	passageButton: {
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 6,
		paddingVertical: 4,
	},
	passageButtonText: {
		fontFamily: 'lexend-700',
		fontSize: 14,
	},
	deckInfoContainer: {
		display: 'flex',
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderTopWidth: 1,
		borderColor: colors.light.goldenBorder,
	},
	deckInfoColumn: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: '33.3333%',
		flexGrow: 1,
		flexShrink: 1,
		flex: 1,
		paddingVertical: 4,
	},
	deckInfoColumnSeparator: {
		borderRightWidth: 1,
		borderColor: colors.light.goldenBorder,
	},
	deckInfoText: {
		fontSize: 12,
		fontFamily: 'lexend-400',
	},
	deckBoxRightBorder: {
		flex: 23,
	},
	deckBoxBottom: {
		width: '100%',
		aspectRatio: 761 / 22,
		marginTop: -2,
	},
	selectDeckButtonContainer: {
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderBottomRightRadius: 6,
		borderBottomLeftRadius: 6,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginHorizontal: 2,
		marginVertical: 2,
		gap: 8,
	},
	selectDeckButtonText: {
		color: colors.light.background,
	},
});
