import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckRankCounts, {
	DeckRankCounts,
	emptyDeckRankCounts,
} from '@/src/db/queries/getDeckRankCounts';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ImageBackground, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import colors from '../../app/colors';
import sharedStyles from '../../app/sharedStyles';
import { useUserContext } from '../../db/useUserContext';
import { getDeckCompletionPercent } from '../../util/deckCompletion';
import type { ProgressById } from '../../util/progression';
import type { WordProgressKey } from '../../util/wordRanks';
import type { CardDeck } from '../CardDeck/cardDeckTypes';
import GradientText from '../GradientText';
import LinkButton from '../LinkButton';
import SecondaryButton from '../SecondaryButton';
import SVGArrowUpFromLine from '../SVG/SVGArrowUpFromLine';
import SVGRightArrow from '../SVG/SVGRightArrow';
import DeckBoxModal from './DeckBoxModal';

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

	/**
	 * Destructure styles
	 */
	const {
		cardStyle,
		cardInnerStyle,
		cardInnerBorder,
		cardHeaderStyle,
		gradientTextContainer,
		descriptionStyle,
		CEFRGradientStyle,
		CEFRLabelStyle,
		CEFRTextStyle,
		imageStyle,
		badgeContainerStyle,
		badgeCountContainerStyle,
		badgeCountTextStyle,
		storyProgressContainerStyle,
		storyProgressHeaderStyle,
		storyProgressTitleStyle,
		storyProgressTextStyle,
		storyProgressStyle,
		storyProgressButtonContainerStyle,
		storyProgressButtonStyle,
		storyProgressButtonTextStyle,
		plopContainerStyle,
		plopStyle,
		cardFooterStyle,
	} = styles;

	const badgeIconSize = 14;
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
	 * Render the card grid
	 */
	return (
		<View style={cardStyle}>
			<View style={cardInnerStyle}>
				<DeckBoxModal
					deck={deck}
					modalVisible={modalVisible}
					rankCounts={rankCounts}
					setModalVisible={setModalVisible}
					wordProgressKeyByWordId={wordProgressKeyByWordId}
				/>
				<View style={cardInnerBorder}>
					<View style={cardHeaderStyle}>
						<View style={gradientTextContainer}>
							<GradientText
								fontSize={20}
								fontWeight={700}
								colors={[deck.colors.dark.primary, deck.colors.dark.secondary]}
								text={deck.title}
							/>
						</View>
						<Text style={descriptionStyle}>{deck.description}</Text>
					</View>

					<View>
						<LinearGradient
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							colors={CEFRGradientLight}
							style={CEFRGradientStyle}
						>
							<Text style={CEFRLabelStyle}>CEFR</Text>
							<Text style={CEFRTextStyle}>{deck.CEFR.join(' - ')}</Text>
						</LinearGradient>
						<ImageBackground
							source={deck.image}
							style={imageStyle}
						/>
						<LinearGradient
							style={badgeContainerStyle}
							colors={[deck.colors.dark.secondary, deck.colors.dark.primary]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
						>
							<View style={badgeCountContainerStyle}>
								<Text style={badgeCountTextStyle}>{rankCounts.unseen}</Text>
								<MaterialIcons
									color={colors.light.text}
									size={badgeIconSize}
									name="visibility-off"
								/>
							</View>
							<View style={badgeCountContainerStyle}>
								<Text style={badgeCountTextStyle}>{rankCounts.fnew}</Text>
								<MaterialIcons
									color={colors.light.text}
									size={badgeIconSize}
									name="fiber-new"
								/>
							</View>
							<View style={badgeCountContainerStyle}>
								<Text style={badgeCountTextStyle}>{rankCounts.bronze}</Text>
								<MaterialIcons
									color={colors.light.text}
									size={badgeIconSize}
									name="stars"
								/>
							</View>
							<View style={badgeCountContainerStyle}>
								<Text style={badgeCountTextStyle}>{rankCounts.silver}</Text>
								<MaterialIcons
									color={colors.light.text}
									size={badgeIconSize}
									name="military-tech"
								/>
							</View>
							<View style={badgeCountContainerStyle}>
								<Text style={badgeCountTextStyle}>{rankCounts.gold}</Text>
								<MaterialIcons
									color={colors.light.text}
									size={badgeIconSize}
									name="emoji-events"
								/>
							</View>
							<View style={badgeCountContainerStyle}>
								<Text style={badgeCountTextStyle}>{rankCounts.diamond}</Text>
								<MaterialIcons
									color={colors.light.text}
									size={badgeIconSize}
									name="diamond"
								/>
							</View>
						</LinearGradient>
					</View>

					<View style={storyProgressContainerStyle}>
						<View style={storyProgressHeaderStyle}>
							<Text style={[storyProgressTitleStyle, { color: deck.colors.dark.primary }]}>
								Story Progress
							</Text>
							<Text style={[storyProgressTextStyle, { color: deck.colors.dark.primary }]}>
								{deckCompletionPercent}%
							</Text>
						</View>
						<View style={storyProgressStyle}>
							<View style={plopContainerStyle}>
								{deck.story?.map(({ wordId, text }, index) => {
									const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';

									return (
										<View
											key={`plop-${index}-${wordId}-${text}`}
											style={[plopStyle, plopStyleByProgress[progress]]}
										/>
									);
								})}
							</View>
						</View>
						<View style={storyProgressButtonContainerStyle}>
							<SecondaryButton
								style={[
									storyProgressButtonStyle,
									{
										borderColor: deck.colors.dark.primary,
										shadowColor: deck.colors.dark.primary,
									},
								]}
								textStyle={[storyProgressButtonTextStyle, { color: deck.colors.dark.primary }]}
								onPress={handleShowStory}
								hitSlop={4}
								SVGElement={
									<SVGArrowUpFromLine
										color={colors.dark.text}
										height="14px"
										width="14px"
									/>
								}
							>
								Show Story
							</SecondaryButton>
							<SecondaryButton
								style={[
									storyProgressButtonStyle,
									{
										borderColor: deck.colors.dark.primary,
										shadowColor: deck.colors.dark.primary,
									},
								]}
								textStyle={[storyProgressButtonTextStyle, { color: deck.colors.dark.primary }]}
								onPress={handleViewCards}
								hitSlop={4}
								SVGElement={
									<SVGRightArrow
										height="14px"
										width="14px"
										color={colors.dark.text}
									/>
								}
							>
								View Cards
							</SecondaryButton>
						</View>
					</View>

					<View style={cardFooterStyle}>
						<LinkButton
							handler={() => handleDeckSelect(deck)}
							deckColors={deck.colors}
						>
							Review this deck
						</LinkButton>
					</View>
				</View>
			</View>
		</View>
	);
}

/**
 * Destructure shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
	cardStyle: {
		padding: containerMargin,
		backgroundColor: colors.dark.background,
		borderRadius: 8,
		overflow: 'hidden',
	},
	cardInnerStyle: {
		borderRadius: 16,
		backgroundColor: colors.light.background,
		shadowOffset: { width: 0, height: 16 },
		marginBottom: 8,
		shadowOpacity: 1,
		shadowColor: colors.dark.border,
		shadowRadius: 0,
	},
	cardInnerBorder: {
		borderRadius: 16,
		borderWidth: 2,
		borderColor: colors.light.border,
	},
	cardHeaderStyle: {
		paddingVertical: 16,
		paddingHorizontal: 16,
	},
	gradientTextContainer: {
		display: 'flex',
		flexShrink: 1,
		justifyContent: 'center',
	},
	descriptionStyle: {
		color: colors.dark.text,
		wordWrap: 'wrap',
		fontSize: 14,
		fontFamily: 'lexend-400',
	},
	CEFRGradientStyle: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignSelf: 'flex-start',
		overflow: 'hidden',
		width: '100%',
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: colors.light.border,
	},
	CEFRLabelStyle: {
		fontSize: 12,
		fontFamily: 'lexend-400',
	},
	CEFRTextStyle: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	imageStyle: {
		display: 'flex',
		justifyContent: 'flex-end',
		height: 120,
	},
	badgeContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		paddingVertical: 1,
		borderColor: colors.light.border,
	},
	badgeCountContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	badgeCountTextStyle: {
		fontFamily: 'azeret-mono-600',
		color: colors.light.text,
		fontSize: 12,
	},
	storyProgressContainerStyle: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderColor: colors.light.border,
		marginBottom: 12,
		gap: 8,
	},
	storyProgressHeaderStyle: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignContent: 'center',
	},
	storyProgressTitleStyle: {
		fontSize: 14,
		fontFamily: 'lexend-600',
	},
	storyProgressTextStyle: {
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	storyProgressStyle: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	storyProgressButtonContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		gap: 8,
	},
	storyProgressButtonStyle: {
		flexGrow: 1,
	},
	storyProgressButtonTextStyle: {
		fontSize: 12,
	},
	plopContainerStyle: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 1,
	},
	plopStyle: {
		width: 10,
		height: 4,
		borderWidth: 1,
		borderColor: colors.dark.border,
	},
	cardFooterStyle: {
		paddingHorizontal: 16,
		marginBottom: 16,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
});
