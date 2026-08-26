import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckRankCounts, {
	DeckRankCounts,
	emptyDeckRankCounts,
} from '@/src/db/queries/getDeckRankCounts';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
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
	} = styles;

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
									<View
										style={[deckBoxMetaStyle, { backgroundColor: atlasLocation.chapter.color }]}
									>
										<MaterialIcons
											name={atlasLocation.chapter.materialIconName ?? 'help-outline'}
											size={36}
											color={'#b6996d'}
										/>
										<Text>{atlasLocation.chapterNumber}</Text>
									</View>
								</View>
							)}
							<View style={deckBoxContentStyle}>
								{atlasLocation && (
									<Text style={[deckBoxMetaTextStyle]}>
										{atlasLocation.chapter.chapterName} {atlasLocation.chapter.name} {'>'}{' '}
										{atlasLocation.place.name}
									</Text>
								)}
								<Text>Dawn at the Drop Off</Text>
								<Text>Stuff</Text>
								<Pressable>
									<Text>View story</Text>
								</Pressable>
								<View>
									<View>
										<MaterialIcons
											name={'diamond'}
											size={24}
											color={colors.dark.border}
										/>
										<Text>A1 - A2</Text>
									</View>
									<View>
										<MaterialIcons
											name={'diamond'}
											size={24}
											color={colors.dark.border}
										/>
										<Text>80 Cards</Text>
									</View>
									<View>
										<MaterialIcons
											name={'diamond'}
											size={24}
											color={colors.dark.border}
										/>
										<Text>{deckCompletionPercent}% known</Text>
									</View>
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
		borderColor: '#b6996d',
		margin: 8,
	},
	deckBoxContentStyle: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		flex: 1,
		padding: 8,
		margin: 8,
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
	},
	deckBoxMetaTextStyle: {
		flex: 1,
		fontFamily: 'lexend-600',
		fontSize: 11,
	},
});
