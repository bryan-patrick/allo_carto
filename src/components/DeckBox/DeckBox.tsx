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
	 * Destructure styles
	 */
	const {
		deckBoxContainerStyle,
		deckBoxTopStyle,
		deckBoxMiddleStyle,
		deckBoxLeftBorderStyle,
		deckBoxContentBackgroundStyle,
		deckBoxContentBorderStyle,
		chapterBadgeContainerStyle,
		chapterBadgeStyle,
		chapterNumberStyle,
		deckDetailsStyle,
		chapterHeadingStyle,
		deckTitleSeparatorStyle,
		deckTitleSeparatorDotStyle,
		deckTitleStyle,
		deckDescriptionStyle,
		passageButtonStyle,
		passageButtonTextStyle,
		deckInfoContainerStyle,
		deckInfoColumnStyle,
		deckInfoColumnSeparatorStyle,
		deckInfoTextStyle,
		deckBoxRightBorderStyle,
		deckBoxBottomStyle,
		selectDeckButtonContainerStyle,
	} = styles;

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
			<View style={deckBoxContainerStyle}>
				<ImageBackground
					source={deckBoxTopImage}
					style={deckBoxTopStyle}
					resizeMode="stretch"
				>
					<ImageBackground
						source={deckBoxTopMaskImage}
						style={[deckBoxTopStyle, { zIndex: 1 }]}
						resizeMode="stretch"
					/>
				</ImageBackground>
				<View style={deckBoxMiddleStyle}>
					<ImageBackground
						source={deckBoxLeftBorderImage}
						style={deckBoxLeftBorderStyle}
						resizeMode="stretch"
					/>
					<ImageBackground
						source={deckBoxContentImage}
						style={deckBoxContentBackgroundStyle}
						resizeMode="stretch"
					>
						<View style={deckBoxContentBorderStyle}>
							{chapter && (
								<View style={chapterBadgeContainerStyle}>
									<View style={[chapterBadgeStyle, { backgroundColor: chapterColor }]}>
										<MaterialIcons
											name={chapterIconName}
											size={24}
											color={colors.light.goldenBorder}
										/>
										<Text style={chapterNumberStyle}>{chapterNumber}</Text>
									</View>
								</View>
							)}
							<View style={deckDetailsStyle}>
								{chapter && (
									<Text style={chapterHeadingStyle}>
										{chapterLabel} {chapterName}
									</Text>
								)}
								<View style={deckTitleSeparatorStyle}>
									<View style={deckTitleSeparatorDotStyle} />
								</View>
								<Text style={deckTitleStyle}>{deckTitle}</Text>
								<Text style={deckDescriptionStyle}>{deckDescription}</Text>
								<Pressable
									onPress={handleShowPassage}
									onPressIn={handlePassageButtonPressIn}
									onPressOut={handlePassageButtonPressOut}
									style={[passageButtonStyle, { borderColor: chapterColor }]}
								>
									<MaterialIcons
										name="menu-book"
										size={20}
										color={chapterColor}
									/>
									<Text style={[passageButtonTextStyle, { color: chapterColor }]}>
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
							<View style={deckInfoContainerStyle}>
								<View style={[deckInfoColumnStyle, deckInfoColumnSeparatorStyle]}>
									<MaterialIcons
										name="language"
										size={24}
										color={chapterColor}
									/>
									<Text style={[deckInfoTextStyle, { color: chapterColor }]}>
										{deckMetadata.CEFRLabel}
									</Text>
								</View>
								<View style={[deckInfoColumnStyle, deckInfoColumnSeparatorStyle]}>
									<MaterialIcons
										name="style"
										size={24}
										color={chapterColor}
									/>
									<Text style={[deckInfoTextStyle, { color: chapterColor }]}>
										{deckMetadata.cardCount} Cards
									</Text>
								</View>
								<View style={deckInfoColumnStyle}>
									<MaterialIcons
										name="star-outline"
										size={24}
										color={chapterColor}
									/>
									<Text style={[deckInfoTextStyle, { color: chapterColor }]}>
										{deckMetadata.completionPercent}% known
									</Text>
								</View>
							</View>
						</View>
					</ImageBackground>
					<ImageBackground
						source={deckBoxRightBorderImage}
						style={deckBoxRightBorderStyle}
						resizeMode="stretch"
					/>
				</View>
				<ImageBackground
					source={deckBoxBottomImage}
					style={deckBoxBottomStyle}
					resizeMode="stretch"
				/>
			</View>
			<View style={selectDeckButtonContainerStyle}>
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
	deckBoxContainerStyle: {
		position: 'relative',
		margin: 8,
	},
	deckBoxTopStyle: {
		width: '100%',
		aspectRatio: 761 / 135,
	},
	deckBoxMiddleStyle: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: -24,
	},
	deckBoxLeftBorderStyle: {
		flex: 22,
	},
	deckBoxContentBackgroundStyle: {
		flex: 719,
	},
	deckBoxContentBorderStyle: {
		borderWidth: 2,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		margin: 12,
		marginTop: 6,
	},
	chapterBadgeContainerStyle: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 4,
	},
	chapterBadgeStyle: {
		paddingTop: 20,
		paddingHorizontal: 32,
		paddingBottom: 8,
		justifyContent: 'center',
		gap: 4,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
	chapterNumberStyle: {
		textAlign: 'center',
		color: colors.light.goldenBorder,
		fontFamily: 'azeret-mono-600',
		fontSize: 12,
	},
	deckDetailsStyle: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		flex: 1,
		padding: 8,
		margin: 4,
		gap: 6,
	},
	chapterHeadingStyle: {
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		marginBottom: 4,
	},
	deckTitleSeparatorStyle: {
		position: 'relative',
		borderTopWidth: 1,
		borderColor: colors.light.goldenBorder,
		marginVertical: 4,
		width: '50%',
	},
	deckTitleSeparatorDotStyle: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		borderRadius: '50%',
		transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
		width: 8,
		height: 8,
		backgroundColor: colors.light.goldenBorder,
	},
	deckTitleStyle: {
		marginTop: 2,
		fontFamily: 'lexend-600',
		fontSize: 24,
		textAlign: 'center',
		color: colors.dark.text,
	},
	deckDescriptionStyle: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		textAlign: 'center',
		color: colors.dark.text,
	},
	passageButtonStyle: {
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
	passageButtonTextStyle: {
		fontFamily: 'lexend-600',
	},
	deckInfoContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		borderTopWidth: 2,
		paddingVertical: 16,
		borderColor: colors.light.goldenBorder,
		marginTop: -12,
	},
	deckInfoColumnStyle: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexGrow: 1,
		flex: 1,
		gap: 4,
	},
	deckInfoColumnSeparatorStyle: {
		borderRightWidth: 2,
		borderColor: colors.light.goldenBorder,
	},
	deckInfoTextStyle: {
		fontSize: 14,
		fontFamily: 'lexend-400',
	},
	deckBoxRightBorderStyle: {
		flex: 23,
	},
	deckBoxBottomStyle: {
		width: '100%',
		aspectRatio: 761 / 22,
		marginTop: -2,
	},
	selectDeckButtonContainerStyle: {
		marginHorizontal: 8,
		marginBottom: 16,
	},
});
