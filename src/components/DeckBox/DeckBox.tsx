import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckRankCounts, {
	DeckRankCounts,
	emptyDeckRankCounts,
} from '@/src/db/queries/getDeckRankCounts';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
	Animated,
	ImageBackground,
	Pressable,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from 'react-native';
import colors from '../../app/colors';
import { useUserContext } from '../../db/useUserContext';
import { findAtlasLocationByPlaceId } from '../../util/atlasCompletion';
import { getDeckCompletionPercent } from '../../util/deckCompletion';
import type { ProgressById } from '../../util/progression';
import type { WordProgressKey } from '../../util/wordRanks';
import type { CardDeck } from '../CardDeck/cardDeckTypes';
import DeckBoxModal from './DeckBoxModal';

const deckBoxBorderBottom = require('@/src/app/assets/images/decks/deck-box-border-bottom.png');
const deckBoxBorderLeft = require('@/src/app/assets/images/decks/deck-box-border-left.png');
const deckBoxBorderRight = require('@/src/app/assets/images/decks/deck-box-border-right.png');
const deckBoxContentArea = require('@/src/app/assets/images/decks/deck-box-content-area.png');
const deckBoxTop = require('@/src/app/assets/images/decks/deck-box-top.png');
const deckBoxTopMask = require('@/src/app/assets/images/decks/deck-box-top-mask.png');

const plopStyleByProgress: Record<WordProgressKey, ViewStyle> = {
	unseen: {
		backgroundColor: 'transparent',
		borderColor: colors.dark.border,
		opacity: 0.35,
	},
	fnew: {
		backgroundColor: colors.light.rank.fnew,
		borderColor: colors.dark.rank.fnew,
		opacity: 0.2,
	},
	bronze: {
		backgroundColor: colors.light.rank.bronze,
		borderColor: colors.dark.rank.bronze,
		opacity: 0.75,
	},
	silver: {
		backgroundColor: colors.light.rank.silver,
		borderColor: colors.dark.rank.silver,
		opacity: 0.85,
	},
	gold: {
		backgroundColor: colors.light.rank.gold,
		borderColor: colors.dark.rank.gold,
		opacity: 0.95,
	},
	diamond: {
		backgroundColor: colors.light.rank.diamond,
		borderColor: colors.dark.rank.diamond,
		opacity: 1,
	},
};

/**
 * Typing
 */
interface SelectCardDeckProps {
	deck: CardDeck;
	placeId?: string;
	isLocked: boolean;
	progressById: ProgressById;
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck, placeId }: SelectCardDeckProps) {
	const userId = useUserContext()?.id;
	const { cardDeckDispatch } = useCardDeck();
	const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);
	const [wordProgressKeyByWordId, setWordProgressKeyByWordId] = useState<
		Record<string, WordProgressKey>
	>({});
	const [modalVisible, setModalVisible] = useState(false);
	const [viewStoryChevronTranslateY] = useState(() => new Animated.Value(0));
	const atlasLocation = findAtlasLocationByPlaceId(placeId);

	const CEFRGradientLight: readonly [string, string] = [
		colors.light.CEFR[deck.CEFR[0]],
		colors.light.CEFR[deck.CEFR.at(-1)!],
	];

	/**
	 * Deck completion
	 */
	const deckCompletionPercent = Math.floor(
		getDeckCompletionPercent({
			deckWordCount: deck.wordIds.length,
			rankCounts,
		}),
	);

	/**
	 * Data loaders
	 */
	const loadRankCounts = useCallback(async () => {
		try {
			if (!userId) {
				setRankCounts(emptyDeckRankCounts);
				return;
			}

			const database = await getDB();
			const counts = await getDeckRankCounts({
				database,
				userId,
				wordIds: deck.wordIds,
			});

			setRankCounts(counts);
		} catch (error) {
			console.error('Could not retrieve deck rank counts:', error);
		}
	}, [userId, deck.wordIds]);

	const loadStoryWordProgress = useCallback(async () => {
		try {
			if (userId) {
				const storyWordProgressKeyByWordId = await getWordProgressById({
					userId,
					story: deck.story,
				});

				setWordProgressKeyByWordId(storyWordProgressKeyByWordId);
				return;
			}

			setWordProgressKeyByWordId({});
		} catch (error) {
			console.error('Could not retrieve story word progress:', error);
		}
	}, [userId, deck.story]);

	/**
	 * The story blips weren't updating when returning
	 * to the deck selection after completing a deck.
	 * This forces it.
	 */
	useFocusEffect(
		useCallback(() => {
			loadRankCounts();
			loadStoryWordProgress();
		}, [loadRankCounts, loadStoryWordProgress]),
	);

	/**
	 * ReviewDeck handler
	 */
	const handleDeckSelect = useCallback(
		async (selectedDeck: CardDeck) => {
			if (userId) {
				const deck = await getDeck({
					deck: selectedDeck,
					userId,
				});

				if (deck) {
					cardDeckDispatch({ type: 'SET_DECK', payload: deck });
					router.push('/CardDeckRankSelect');
				}
			}
		},
		[userId, cardDeckDispatch],
	);

	/**
	 * Refresh story data and show modal
	 */
	async function handleShowStory() {
		await Promise.all([loadRankCounts(), loadStoryWordProgress()]);

		setModalVisible(true);
	}

	function handleViewStoryPressIn() {
		Animated.timing(viewStoryChevronTranslateY, {
			toValue: -3,
			duration: 90,
			useNativeDriver: true,
		}).start();
	}

	function handleViewStoryPressOut() {
		Animated.timing(viewStoryChevronTranslateY, {
			toValue: 0,
			duration: 140,
			useNativeDriver: true,
		}).start();
	}

	/**
	 * Open the full card list for this deck.
	 */
	function handleViewCards() {
		router.push({
			pathname: '/ViewCards',
			params: {
				deckTitle: deck.title,
				placeId,
			},
		});
	}

	/**
	 * Destructure styles
	 */
	const {
		deckBoxContentAreaStyle,
		deckBoxContainer,
		deckBoxContentStyle,
		deckBoxContentAreaBorder,
		deckBoxMiddleStyle,
		deckBoxMetaContainerStyle,
		deckBoxMetaStyle,
		deckBoxMetaTextStyle,
		deckBoxBorderLeftStyle,
		deckBoxBorderRightStyle,
		deckBoxTopStyle,
		deckBoxBorderBottomStyle,
		deckBoxChapterNumberStyle,
		deckTitleStyle,
		deckDescriptionStyle,
		separatorContainerStyle,
		separatorBallStyle,
		viewStoryBtnStyle,
		viewStoryBtnTextStyle,
		deckInfoContainerStyle,
		infoColStyle,
		gridSeparator,
	} = styles;

	/**
	 * Destructure chapter props
	 */
	const { name, label, materialIconName, color } = atlasLocation?.chapter!;

	/**
	 * Render the Deck Box
	 */
	return (
		<>
			<DeckBoxModal
				deck={deck}
				modalVisible={modalVisible}
				rankCounts={rankCounts}
				setModalVisible={setModalVisible}
				wordProgressKeyByWordId={wordProgressKeyByWordId}
			/>
			<View style={deckBoxContainer}>
				<ImageBackground
					source={deckBoxTop}
					style={deckBoxTopStyle}
					resizeMode="stretch"
				>
					<ImageBackground
						source={deckBoxTopMask}
						style={[deckBoxTopStyle, { zIndex: 1 }]}
						resizeMode="stretch"
					/>
				</ImageBackground>
				<View style={deckBoxMiddleStyle}>
					<ImageBackground
						source={deckBoxBorderLeft}
						style={deckBoxBorderLeftStyle}
						resizeMode="stretch"
					/>
					<ImageBackground
						style={deckBoxContentAreaStyle}
						source={deckBoxContentArea}
						resizeMode="stretch"
					>
						<View style={deckBoxContentAreaBorder}>
							{atlasLocation && (
								<View style={[deckBoxMetaContainerStyle]}>
									<View style={[deckBoxMetaStyle, { backgroundColor: color }]}>
										<MaterialIcons
											name={materialIconName}
											size={32}
											color={colors.light.goldenBorder}
										/>
										<Text style={[deckBoxChapterNumberStyle]}>{atlasLocation.chapterNumber}</Text>
									</View>
								</View>
							)}
							<View style={deckBoxContentStyle}>
								{atlasLocation && (
									<Text style={deckBoxMetaTextStyle}>
										{label}: {name}
									</Text>
								)}
								<View style={separatorContainerStyle}>
									<View style={separatorBallStyle} />
								</View>
								<Text style={deckTitleStyle}>{deck.title}</Text>
								<Text style={deckDescriptionStyle}>{deck.description}</Text>
								<Pressable
									onPress={handleShowStory}
									onPressIn={handleViewStoryPressIn}
									onPressOut={handleViewStoryPressOut}
									style={[viewStoryBtnStyle, { borderColor: color }]}
								>
									<MaterialIcons
										name={'menu-book'}
										size={20}
										color={color}
									/>
									<Text style={[viewStoryBtnTextStyle, { color }]}>View paragraph</Text>
									<Animated.View
										style={{ transform: [{ translateY: viewStoryChevronTranslateY }] }}
									>
										<MaterialIcons
											name="keyboard-arrow-up"
											size={20}
											color={color}
										/>
									</Animated.View>
								</Pressable>
							</View>
							<View style={deckInfoContainerStyle}>
								<View style={[infoColStyle, gridSeparator]}>
									<MaterialIcons
										name={'language'}
										size={24}
										color={colors.dark.border}
									/>
									<Text>A1 - A2</Text>
								</View>
								<View style={[infoColStyle, gridSeparator]}>
									<MaterialIcons
										name={'library-books'}
										size={24}
										color={colors.dark.border}
									/>
									<Text>80 Cards</Text>
								</View>
								<View style={infoColStyle}>
									<MaterialIcons
										name={'psychology'}
										size={24}
										color={colors.dark.border}
									/>
									<Text>{deckCompletionPercent}% known</Text>
								</View>
							</View>
						</View>
					</ImageBackground>
					<ImageBackground
						source={deckBoxBorderRight}
						style={deckBoxBorderRightStyle}
						resizeMode="stretch"
					/>
				</View>
				<ImageBackground
					source={deckBoxBorderBottom}
					style={deckBoxBorderBottomStyle}
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
		margin: 8,
	},
	deckBoxTopStyle: {
		width: '100%',
		aspectRatio: 761 / 135,
	},
	deckBoxMiddleStyle: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: -22,
	},
	deckBoxBorderLeftStyle: {
		flex: 22,
	},
	deckBoxBorderRightStyle: {
		flex: 23,
	},
	deckBoxBorderBottomStyle: {
		width: '100%',
		aspectRatio: 761 / 22,
	},
	deckBoxContentAreaStyle: {
		flex: 719,
	},
	deckBoxContentAreaBorder: {
		borderWidth: 2,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		margin: 16,
		marginTop: 12,
	},
	deckBoxContentStyle: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		flex: 1,
		padding: 8,
		margin: 8,
		gap: 4,
	},
	deckBoxMetaContainerStyle: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 4,
	},
	deckBoxMetaStyle: {
		paddingTop: 16,
		paddingHorizontal: 32,
		paddingBottom: 8,
		justifyContent: 'center',
		gap: 4,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
	deckBoxChapterNumberStyle: {
		textAlign: 'center',
		color: colors.light.goldenBorder,
		fontFamily: 'azeret-mono-600',
		fontSize: 14,
	},
	deckBoxMetaTextStyle: {
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		marginBottom: 4,
	},
	separatorContainerStyle: {
		position: 'relative',
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		marginVertical: 8,
		width: '50%',
	},
	separatorBallStyle: {
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
	viewStoryBtnStyle: {
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
	viewStoryBtnTextStyle: {
		fontFamily: 'lexend-600',
	},
	deckInfoContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		borderTopWidth: 2,
		paddingVertical: 16,
		borderColor: colors.light.goldenBorder,
		marginTop: -8,
	},
	infoColStyle: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexGrow: 1,
		flex: 1,
		gap: 4,
	},
	gridSeparator: {
		borderRightWidth: 2,
		borderColor: colors.light.goldenBorder,
	},
});
