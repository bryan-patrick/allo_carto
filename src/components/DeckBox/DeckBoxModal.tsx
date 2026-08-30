import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, ImageBackground, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import type { DeckRankCounts } from '../../db/queries/getDeckRankCounts';
import { getDeckCompletionPercent } from '../../util/deckCompletion';
import type { WordProgressKey } from '../../util/wordRanks';
import type { CardDeck } from '../CardDeck/cardDeckTypes';

const modalBackground = require('@/src/app/assets/images/decks/paragraph-background.jpg');

/**
 * Typing
 */
interface DeckBoxModalProps {
	deck: CardDeck;
	modalVisible: boolean;
	rankCounts: DeckRankCounts;
	setModalVisible: (modalVisible: boolean) => void;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * DeckBoxModal component
 */
export default function DeckBoxModal({
	deck,
	modalVisible,
	rankCounts,
	setModalVisible,
	wordProgressKeyByWordId,
}: DeckBoxModalProps) {
	/**
	 * Destructure styles
	 */
	const {
		centeredView,
		modalView,
		modalInner,
		modalScrollView,
		headerStyle,
		modalTextContentStyle,
		modalText,
		titleContainerStyle,
		titleStyle,
		placeContainerStyle,
		placeTextStyle,
	} = styles;

	/**
	 * Header deck completion percentage
	 */
	const wordsSeenCount =
		rankCounts.fnew + rankCounts.bronze + rankCounts.silver + rankCounts.gold + rankCounts.diamond;
	const deckCompletionPercent = Math.floor(
		getDeckCompletionPercent({
			deckWordCount: deck.wordIds.length,
			rankCounts,
		}),
	);

	/**
	 * Render the modal
	 */
	return (
		<Modal
			animationType="slide"
			presentationStyle="fullScreen"
			backdropColor={colors.dark.text}
			transparent={false}
			visible={modalVisible}
			onRequestClose={() => {
				Alert.alert('Modal has been closed.');
				setModalVisible(!modalVisible);
			}}
		>
			<View style={centeredView}>
				<ImageBackground
					style={modalView}
					source={modalBackground}
					resizeMode="stretch"
				>
					<View style={modalInner}>
						{/**
						 * Modal Header
						 */}
						<View style={headerStyle}>
							<View style={titleContainerStyle}>
								<Text style={[titleStyle, { color: deck.colors.dark.primary }]}>{deck.title}</Text>
							</View>
							<View style={placeContainerStyle}>
								<MaterialIcons
									color={'#000000'}
									size={18}
									name="place"
								/>
								<Text style={placeTextStyle}>{deck.place}</Text>
							</View>
						</View>

						{/**
						 * Modal Content
						 */}
						<ScrollView
							style={modalScrollView}
							showsVerticalScrollIndicator={true}
							persistentScrollbar={true}
							indicatorStyle={'white'}
						>
							<Text style={modalTextContentStyle}>
								{deck.story &&
									deck.story.map(({ text, wordId, after }, index) => {
										const key = `${index}-${wordId ?? text}`;
										const spaceMaybeButNotAlways = after ?? ' ';
										const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';
										const progressColor =
											progress === 'unseen' ? colors.dark.text : colors.dark.rank[progress];

										const wordStyle: any = {
											color: progressColor,
											fontFamily: 'lexend-400',
											lineHeight: 32,
											textDecorationLine: 'underline',
											textDecorationStyle: 'dotted',
											textDecorationColor: 'transparent',
										};

										switch (progress) {
											case 'unseen':
												wordStyle.color = 'transparent';
												wordStyle.textDecorationColor = colors.light.goldenBorder;
												break;
											case 'fnew':
												wordStyle.opacity = 0.8;
												break;
											case 'silver':
												break;
											case 'gold':
												wordStyle.textShadowRadius = 2;
												break;
											case 'diamond':
												wordStyle.textShadowRadius = 8;
												break;
										}

										return (
											<Text
												key={key}
												style={modalText}
											>
												<Text style={wordStyle}>{text}</Text>
												{spaceMaybeButNotAlways}
											</Text>
										);
									})}
							</Text>
						</ScrollView>
					</View>
				</ImageBackground>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		padding: 8,
		flex: 1,
	},
	modalView: {
		display: 'flex',
		justifyContent: 'space-between',
		position: 'relative',
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
	},
	modalInner: {
		paddingLeft: 16,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 16,
	},
	headerStyle: {
		padding: 8,
		gap: 4,
	},
	titleContainerStyle: {},
	titleStyle: {
		fontSize: 24,
		fontFamily: 'lexend-600',
	},
	placeContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
	},
	placeTextStyle: {
		fontFamily: 'lexend-400',
		textTransform: 'uppercase',
		fontSize: 12,
	},
	modalTextContentStyle: {
		padding: 8,
	},
	modalScrollView: {
		borderColor: colors.light.background,
	},
	modalTitleStyle: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		paddingTop: 8,
		borderWidth: 2,
		borderBottomWidth: 0,
		borderTopRightRadius: 12,
		borderTopLeftRadius: 12,
	},
	modalHeaderTextStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
		textAlign: 'center',
	},
	modalHeaderMonospaceTextStyle: {
		color: colors.dark.text,
		fontFamily: 'azeret-mono-600',
		fontSize: 14,
	},
	modalText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 16,
	},
});
