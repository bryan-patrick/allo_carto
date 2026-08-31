import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import LinkButton from '@/src/components/LinkButton';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	emptyDeckWordProgressCounts,
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { findAtlasLocationByPlaceId } from '@/src/util/atlasCompletion';
import { getDeckCompletionPercent } from '@/src/util/deckCompletion';
import type { WordProgressKey } from '@/src/util/wordProgress';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
const deckBoxContentImage = require('@/src/app/assets/images/decks/deck-box-content-area.png');
const deckBoxRightBorderImage = require('@/src/app/assets/images/decks/deck-box-border-right.png');
const deckBoxBottomImage = require('@/src/app/assets/images/decks/deck-box-border-bottom.png');

/**
 * Typing
 */
interface DeckBoxProps {
	deck: CardDeck;
	isLocked: boolean;
	placeId?: string;
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck, isLocked, placeId }: DeckBoxProps) {
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
	 * Destructure atlas location and chapter
	 */
	const { chapter, chapterNumber } = findAtlasLocationByPlaceId(placeId) ?? {};
	const {
		color: chapterColor = colors.dark.primary,
		label: chapterLabel = '',
		materialIconName: chapterIconName = 'help-outline',
		name: chapterName = '',
	} = chapter ?? {};

	/**
	 * Deck metadata
	 */
	const deckCardCount = wordIds.length;
	const deckCEFRLabel = CEFR.join(' - ');
	const deckCompletionPercent = getDeckCompletionPercent({
		deckWordCount: deckCardCount,
		wordProgressCounts,
	});
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
			<DeckBoxModal
				deck={deck}
				modalVisible={isPassageModalVisible}
				setModalVisible={setIsPassageModalVisible}
				wordProgressCounts={wordProgressCounts}
				wordProgressKeyByWordId={wordProgressKeyByWordId}
			/>
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
						source={deckBoxContentImage}
						style={styles.deckBoxContentBackground}
						resizeMode="stretch"
					>
						<View style={styles.deckBoxContentBorder}>
							{chapter && (
								<View style={styles.chapterBadgeContainer}>
									<View style={[styles.chapterBadge, { backgroundColor: chapterColor }]}>
										<MaterialIcons
											name={chapterIconName}
											size={24}
											color={colors.light.goldenBorder}
										/>
										<Text style={styles.chapterNumber}>{chapterNumber}</Text>
									</View>
								</View>
							)}
							<View style={styles.deckDetails}>
								{chapter && (
									<Text style={styles.chapterHeading}>
										{chapterLabel} {chapterName}
									</Text>
								)}
								<View style={styles.deckTitleSeparator}>
									<View style={styles.deckTitleSeparatorDot} />
								</View>
								<Text style={styles.deckTitle}>{deckTitle}</Text>
								<Text style={styles.deckDescription}>{deckDescription}</Text>
								<Pressable
									onPress={handleShowPassage}
									onPressIn={handlePassageButtonPressIn}
									onPressOut={handlePassageButtonPressOut}
									style={[styles.passageButton, { borderColor: chapterColor }]}
								>
									<MaterialIcons
										name="menu-book"
										size={20}
										color={chapterColor}
									/>
									<Text style={[styles.passageButtonText, { color: chapterColor }]}>
										View passage
									</Text>
									<Animated.View style={{ transform: [{ translateY: passageChevronTranslateY }] }}>
										<MaterialIcons
											name="keyboard-arrow-up"
											size={20}
											color={chapterColor}
										/>
									</Animated.View>
								</Pressable>
							</View>
							<View style={styles.deckInfoContainer}>
								<View style={[styles.deckInfoColumn, styles.deckInfoColumnSeparator]}>
									<MaterialIcons
										name="language"
										size={24}
										color={chapterColor}
									/>
									<Text style={[styles.deckInfoText, { color: chapterColor }]}>
										{deckMetadata.CEFRLabel}
									</Text>
								</View>
								<View style={[styles.deckInfoColumn, styles.deckInfoColumnSeparator]}>
									<MaterialIcons
										name="style"
										size={24}
										color={chapterColor}
									/>
									<Text style={[styles.deckInfoText, { color: chapterColor }]}>
										{deckMetadata.cardCount} Cards
									</Text>
								</View>
								<View style={styles.deckInfoColumn}>
									<MaterialIcons
										name="star-outline"
										size={24}
										color={chapterColor}
									/>
									<Text style={[styles.deckInfoText, { color: chapterColor }]}>
										{deckMetadata.completionPercent}% known
									</Text>
								</View>
							</View>
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
			<View style={styles.selectDeckButtonContainer}>
				<LinkButton
					accessibilityHint={`Start practicing ${deckTitle}.`}
					accessibilityLabel={`Select ${deckTitle}`}
					color={chapterColor}
					disabled={isLocked}
					fullwidth
					handler={handleSelectDeck}
				>
					Select deck
				</LinkButton>
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
		margin: 8,
	},
	deckBoxTop: {
		width: '100%',
		aspectRatio: 761 / 135,
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
		borderWidth: 2,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		margin: 12,
		marginTop: 6,
	},
	chapterBadgeContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 4,
	},
	chapterBadge: {
		paddingTop: 20,
		paddingHorizontal: 32,
		paddingBottom: 8,
		justifyContent: 'center',
		gap: 4,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
	chapterNumber: {
		textAlign: 'center',
		color: colors.light.goldenBorder,
		fontFamily: 'azeret-mono-600',
		fontSize: 12,
	},
	deckDetails: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		flex: 1,
		padding: 8,
		margin: 4,
		gap: 6,
	},
	chapterHeading: {
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		marginBottom: 4,
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
		marginTop: 2,
		fontFamily: 'lexend-600',
		fontSize: 24,
		textAlign: 'center',
		color: colors.dark.text,
	},
	deckDescription: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		textAlign: 'center',
		color: colors.dark.text,
	},
	passageButton: {
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		paddingVertical: 8,
		marginVertical: 16,
		gap: 8,
	},
	passageButtonText: {
		fontFamily: 'lexend-600',
	},
	deckInfoContainer: {
		display: 'flex',
		flexDirection: 'row',
		borderTopWidth: 2,
		paddingVertical: 16,
		borderColor: colors.light.goldenBorder,
		marginTop: -12,
	},
	deckInfoColumn: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexGrow: 1,
		flex: 1,
		gap: 4,
	},
	deckInfoColumnSeparator: {
		borderRightWidth: 2,
		borderColor: colors.light.goldenBorder,
	},
	deckInfoText: {
		fontSize: 14,
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
		marginHorizontal: 8,
		marginBottom: 16,
	},
});
