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
import { type WordProgressKey, wordProgressDefinitions } from '../../util/wordProgress';
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

function getPassageWordOpacity(progress: WordProgressKey, filter: WordProgressKey | null): number {
	if (!filter) return progress === 'unseen' ? 0.5 : 1;

	return progress === filter ? 1 : 0.2;
}

function createWordProgressOpacityValues(): Record<WordProgressKey, Animated.Value> {
	return {
		unseen: new Animated.Value(getPassageWordOpacity('unseen', null)),
		new: new Animated.Value(getPassageWordOpacity('new', null)),
		learning: new Animated.Value(getPassageWordOpacity('learning', null)),
		familiar: new Animated.Value(getPassageWordOpacity('familiar', null)),
		known: new Animated.Value(getPassageWordOpacity('known', null)),
		mastered: new Animated.Value(getPassageWordOpacity('mastered', null)),
	};
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
	const [activeWordProgressFilter, setActiveWordProgressFilter] = useState<WordProgressKey | null>(
		null,
	);
	const [wordProgressOpacityByKey] = useState(createWordProgressOpacityValues);
	const [unseenQuestionOpacity] = useState(() => new Animated.Value(0));
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

	function handleWordProgressFilterPress(progress: WordProgressKey) {
		const nextProgress = activeWordProgressFilter === progress ? null : progress;

		setActiveWordProgressFilter(nextProgress);
		Animated.parallel(
			[
				...wordProgressDefinitions.map(({ key }) =>
					Animated.timing(wordProgressOpacityByKey[key], {
						toValue: getPassageWordOpacity(key, nextProgress),
						duration: 180,
						useNativeDriver: true,
					}),
				),
				Animated.timing(unseenQuestionOpacity, {
					toValue: nextProgress === 'unseen' ? 1 : 0,
					duration: 180,
					useNativeDriver: true,
				}),
			],
			{ stopTogether: false },
		).start();
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
												opacity: wordProgressOpacityByKey[progress],
											};

											switch (progress) {
												case 'unseen':
													wordStyle.color = 'transparent';
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
															<Animated.Text style={wordStyle}>{text}</Animated.Text>
															<Animated.Text
																accessible={false}
																style={[
																	unseenWordQuestionStyle,
																	{
																		color: progressColor,
																		opacity: unseenQuestionOpacity,
																	},
																]}
															>
																?
															</Animated.Text>
														</View>
													:	<Animated.Text style={wordStyle}>{text}</Animated.Text>}
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
								{wordProgressDefinitions.map(({ key, name }) => {
									const progressColor = colors.wordProgress[key];
									const isActive = activeWordProgressFilter === key;
									const wordCount = wordProgressCounts[key];

									return (
										<Pressable
											key={key}
											accessibilityRole="radio"
											accessibilityLabel={`${name}, ${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
											accessibilityState={{ checked: isActive }}
											onPress={() => handleWordProgressFilterPress(key)}
											style={[
												progressLegendItemStyle,
												isActive && { backgroundColor: `${progressColor}33` },
											]}
										>
											<View style={[progressLegendDotStyle, { backgroundColor: progressColor }]} />
											<Text style={progressLegendTextStyle}>{name}</Text>
											<Text style={progressLegendTextStyle}>({wordCount})</Text>
										</Pressable>
									);
								})}
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
		fontSize: 14,
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
		fontSize: 14,
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
		fontSize: 14,
	},
	wordsSeenStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
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
		fontSize: 14,
		lineHeight: 24,
		textAlign: 'center',
	},
	modalFooterStyle: {
		paddingVertical: 16,
		paddingHorizontal: 8,
		gap: 8,
	},
	progressTitleStyle: {
		fontSize: 14,
		fontFamily: 'lexend-600',
		textAlign: 'left',
		color: colors.dark.text,
	},
	progressLegendStyle: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 4,
	},
	progressLegendItemStyle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 6,
		paddingVertical: 4,
		borderRadius: 6,
	},
	progressLegendDotStyle: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	progressLegendTextStyle: {
		color: colors.wordProgress.known,
		fontFamily: 'lexend-400',
		fontSize: 14,
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
