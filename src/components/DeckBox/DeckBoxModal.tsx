import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
	Alert,
	Animated,
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import colors from '../../app/colors';
import type { DeckWordProgressCounts } from '../../db/queries/getDeckWordProgressCounts';
import { getDeckCompletionPercent } from '../../util/deckCompletion';
import { type WordProgressKey, visibleWordProgressDefinitions } from '../../util/wordProgress';
import type { CardDeck } from '../CardDeck/cardDeckTypes';

const modalBackground = require('@/src/app/assets/images/decks/paragraph-background.jpg');

/**
 * Typing
 */
interface DeckBoxModalProps {
	deck: CardDeck;
	modalVisible: boolean;
	setModalVisible: (modalVisible: boolean) => void;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

interface PassageLineMetric {
	y: number;
	height: number;
}

/**
 * DeckBoxModal component
 */
export default function DeckBoxModal({
	deck,
	modalVisible,
	setModalVisible,
	wordProgressCounts,
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
		modalTextContainerStyle,
		modalTextContentStyle,
		modalTextRulesStyle,
		modalTextRuleStyle,
		modalText,
		unseenWordContainerStyle,
		unseenWordQuestionStyle,
		titleContainerStyle,
		titleStyle,
		placeContainerStyle,
		placeTextStyle,
		progressMetaStyle,
		progressMetaLabelStyle,
		progressBarContainerStyle,
		progressBarStyle,
		progressPercentStyle,
		wordsSeenStyle,
		modalFooterStyle,
		progressTitleStyle,
		progressLegendStyle,
		progressLegendItemStyle,
		progressLegendDotStyle,
		progressLegendTextStyle,
		hidePassageButton,
		hidePassageButtonText,
	} = styles;
	const [passageLineMetrics, setPassageLineMetrics] = useState<PassageLineMetric[]>([]);
	const [hidePassageChevronTranslateY] = useState(() => new Animated.Value(0));

	const totalWordCount = deck.wordIds.length;
	const wordsSeenCount =
		wordProgressCounts.new +
		wordProgressCounts.learning +
		wordProgressCounts.familiar +
		wordProgressCounts.known +
		wordProgressCounts.mastered;
	const deckCompletionPercent = getDeckCompletionPercent({
		deckWordCount: totalWordCount,
		wordProgressCounts,
	});

	/**
	 * Hide passage button animation handlers
	 */
	function handleHidePassageButtonPressIn() {
		Animated.timing(hidePassageChevronTranslateY, {
			toValue: 3,
			duration: 90,
			useNativeDriver: true,
		}).start();
	}

	function handleHidePassageButtonPressOut() {
		Animated.timing(hidePassageChevronTranslateY, {
			toValue: 0,
			duration: 140,
			useNativeDriver: true,
		}).start();
	}

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
							<View style={placeContainerStyle}>
								<MaterialIcons
									color={'#000000'}
									size={16}
									name="place"
								/>
								<Text style={placeTextStyle}>{deck.place}</Text>
							</View>
							<View style={titleContainerStyle}>
								<Text style={[titleStyle, { color: deck.colors.dark.primary }]}>{deck.title}</Text>
							</View>
							<View
								style={progressMetaStyle}
								accessible={true}
								accessibilityRole="progressbar"
								accessibilityLabel={`Deck progress ${deckCompletionPercent} percent. ${wordsSeenCount} of ${totalWordCount} words seen.`}
								accessibilityValue={{ min: 0, max: 100, now: deckCompletionPercent }}
							>
								<Text style={progressMetaLabelStyle}>Deck progress</Text>
								<Text style={[progressPercentStyle, { color: deck.colors.dark.primary }]}>
									{deckCompletionPercent}%
								</Text>
								<View style={progressBarContainerStyle}>
									<View
										style={[
											progressBarStyle,
											{
												backgroundColor: deck.colors.dark.primary,
												width: `${deckCompletionPercent}%`,
											},
										]}
									/>
								</View>
								<Text style={wordsSeenStyle}>
									{wordsSeenCount} / {totalWordCount} words seen
								</Text>
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
							<View style={modalTextContainerStyle}>
								<View
									accessible={false}
									pointerEvents="none"
									style={modalTextRulesStyle}
								>
									{passageLineMetrics.map(({ y, height }, index) => (
										<View
											key={index}
											style={[modalTextRuleStyle, { top: y + height }]}
										/>
									))}
								</View>
								<Text
									style={modalTextContentStyle}
									onTextLayout={({ nativeEvent }) => {
										const nextMetrics = nativeEvent.lines.map(({ y, height }) => ({ y, height }));

										setPassageLineMetrics(currentMetrics => {
											const metricsAreUnchanged =
												currentMetrics.length === nextMetrics.length &&
												currentMetrics.every(
													(metric, index) =>
														metric.y === nextMetrics[index].y &&
														metric.height === nextMetrics[index].height,
												);

											return metricsAreUnchanged ? currentMetrics : nextMetrics;
										});
									}}
								>
									{deck.passage &&
										deck.passage.map(({ text, wordId, after }, index) => {
											const key = `${index}-${wordId ?? text}`;
											const spaceMaybeButNotAlways = after ?? ' ';
											const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';
											const isUnseen = progress === 'unseen';
											const progressColor = colors.wordProgress[progress];

											const wordStyle: any = {
												color: progressColor,
												fontFamily: 'lexend-400',
												lineHeight: 24,
												fontSize: 16,
												textDecorationLine: 'underline',
												textDecorationStyle: 'solid',
												textDecorationColor: 'transparent',
											};

											switch (progress) {
												case 'unseen':
													wordStyle.color = 'transparent';
													wordStyle.opacity = 0.5;
													wordStyle.textDecorationColor = colors.light.goldenBorder;
													break;
											}

											return (
												<Text
													key={key}
													style={modalText}
												>
													{isUnseen ?
														<View style={unseenWordContainerStyle}>
															<Text style={wordStyle}>{text}</Text>
															<Text
																accessible={false}
																style={unseenWordQuestionStyle}
															>
																?
															</Text>
														</View>
													:	<Text style={wordStyle}>{text}</Text>}
													{spaceMaybeButNotAlways}
												</Text>
											);
										})}
								</Text>
							</View>
						</ScrollView>
						<View style={modalFooterStyle}>
							<Text style={[progressTitleStyle, { color: deck.colors.dark.primary }]}>
								Word Progress Colors
							</Text>
							<View style={progressLegendStyle}>
								{visibleWordProgressDefinitions.map(({ key, name }) => (
									<View
										key={key}
										style={progressLegendItemStyle}
									>
										<View
											style={[
												progressLegendDotStyle,
												{ backgroundColor: colors.wordProgress[key] },
											]}
										/>
										<Text style={progressLegendTextStyle}>{name}</Text>
										<Text style={progressLegendTextStyle}>({wordProgressCounts[key]})</Text>
									</View>
								))}
							</View>
						</View>
					</View>
				</ImageBackground>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Hide passage"
					onPress={() => setModalVisible(false)}
					onPressIn={handleHidePassageButtonPressIn}
					onPressOut={handleHidePassageButtonPressOut}
					style={hidePassageButton}
				>
					<Text style={[hidePassageButtonText, { color: deck.colors.dark.primary }]}>
						Hide passage
					</Text>
					<Animated.View style={{ transform: [{ translateY: hidePassageChevronTranslateY }] }}>
						<MaterialIcons
							name="expand-more"
							size={20}
							color={deck.colors.dark.primary}
						/>
					</Animated.View>
				</Pressable>
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
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 16,
		gap: 8,
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
		fontSize: 12,
	},
	progressMetaStyle: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	progressMetaLabelStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	progressBarContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		flex: 1,
		minWidth: 48,
		height: 8,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 4,
		backgroundColor: '#00000014',
	},
	progressBarStyle: {
		height: '100%',
		borderRadius: 4,
	},
	progressPercentStyle: {
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
	wordsSeenStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	modalTextContainerStyle: {
		position: 'relative',
	},
	modalTextContentStyle: {},
	modalTextRulesStyle: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	modalTextRuleStyle: {
		position: 'absolute',
		left: 0,
		right: 0,
		borderBottomWidth: 1,
		borderColor: '#D7CDC4',
	},
	modalScrollView: {
		paddingHorizontal: 16,
		borderColor: colors.light.background,
	},
	modalTitleStyle: {},
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
		fontSize: 14,
	},
	unseenWordContainerStyle: {
		position: 'relative',
		flexDirection: 'row',
	},
	unseenWordQuestionStyle: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		color: colors.wordProgress.new,
		fontFamily: 'lexend-600',
		fontSize: 12,
		lineHeight: 24,
		textAlign: 'center',
		opacity: 0,
	},
	modalFooterStyle: {
		paddingVertical: 16,
		paddingHorizontal: 8,
		gap: 8,
	},
	progressTitleStyle: {
		fontSize: 12,
		fontFamily: 'lexend-600',
		textAlign: 'left',
		color: colors.dark.text,
	},
	progressLegendStyle: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 8,
	},
	progressLegendItemStyle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	progressLegendDotStyle: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	progressLegendTextStyle: {
		color: colors.wordProgress.known,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	hidePassageButton: {
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderWidth: 1,
		borderTopWidth: 0,
		paddingVertical: 8,
		paddingHorizontal: 32,
		borderBottomRightRadius: 16,
		borderBottomLeftRadius: 16,
		borderColor: colors.light.goldenBorder,
		backgroundColor: '#E8DED5',
		gap: 4,
		marginTop: -1,
	},
	hidePassageButtonText: {
		fontSize: 14,
		fontFamily: 'lexend-600',
	},
});
