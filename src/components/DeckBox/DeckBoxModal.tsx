import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRef, useState } from 'react';
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

/**
 * Images
 */
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
 * Helper functions
 */
function getPassageWordOpacity(progress: WordProgressKey, filter: WordProgressKey | null): number {
	if (!filter) return progress === 'unseen' ? 0.4 : 1;

	return progress === filter ? 1 : 0.15;
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
	const passageScrollViewRef = useRef<ScrollView>(null);
	const [passageLineMetrics, setPassageLineMetrics] = useState<PassageLineMetric[]>([]);
	const [activeWordProgressFilter, setActiveWordProgressFilter] = useState<WordProgressKey | null>(
		null,
	);
	const [wordProgressOpacityByKey] = useState(createWordProgressOpacityValues);
	const [unseenQuestionOpacity] = useState(() => new Animated.Value(0.4));
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
						duration: 120,
						useNativeDriver: true,
					}),
				),
				Animated.timing(unseenQuestionOpacity, {
					toValue: nextProgress === 'unseen' ? 1 : 0.2,
					duration: 120,
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
			onShow={() => passageScrollViewRef.current?.flashScrollIndicators()}
			onRequestClose={() => {
				Alert.alert('Modal has been closed.');
				setModalVisible(!modalVisible);
			}}
		>
			<View style={styles.centeredView}>
				<ImageBackground
					style={styles.modalView}
					source={modalBackground}
					resizeMode="stretch"
				>
					<View style={styles.modalInner}>
						{/**
						 * Modal Header
						 */}
						<View style={styles.header}>
							<View style={styles.placeContainer}>
								<MaterialIcons
									color={'#000000'}
									size={16}
									name="place"
								/>
								<Text style={styles.placeText}>{deck.place}</Text>
							</View>
							<View>
								<Text style={[styles.title, { color: deck.colors.dark.primary }]}>
									{deck.title}
								</Text>
							</View>
							<View
								style={styles.progressMeta}
								accessible={true}
								accessibilityRole="progressbar"
								accessibilityLabel={`Deck progress ${deckCompletionPercent} percent. ${wordsSeenCount} of ${totalWordCount} words seen.`}
								accessibilityValue={{ min: 0, max: 100, now: deckCompletionPercent }}
							>
								<Text style={styles.progressMetaLabel}>Deck progress</Text>
								<Text style={[styles.progressPercent, { color: deck.colors.dark.primary }]}>
									{deckCompletionPercent}%
								</Text>
								<View style={styles.progressBarContainer}>
									<View
										style={[
											styles.progressBar,
											{
												backgroundColor: deck.colors.dark.primary,
												width: `${deckCompletionPercent}%`,
											},
										]}
									/>
								</View>
								<Text style={styles.wordsSeen}>
									{wordsSeenCount} / {totalWordCount} words seen
								</Text>
							</View>
						</View>

						{/**
						 * Modal Content
						 */}
						<ScrollView
							ref={passageScrollViewRef}
							style={styles.modalScrollView}
							showsVerticalScrollIndicator={true}
							persistentScrollbar={true}
							indicatorStyle={'black'}
						>
							<View style={styles.modalTextContainer}>
								<View
									accessible={false}
									pointerEvents="none"
									style={styles.modalTextRules}
								>
									{passageLineMetrics.map(({ y, height }, index) => (
										<View
											key={index}
											style={[styles.modalTextRule, { top: y + height }]}
										/>
									))}
								</View>
								<Text
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

											const progressStyle = {
												color: progressColor,
												opacity: wordProgressOpacityByKey[progress],
											};

											return (
												<Text
													key={key}
													style={styles.modalText}
												>
													{isUnseen ?
														<View style={styles.unseenWordContainer}>
															<Animated.Text
																style={[
																	styles.passageWord,
																	progressStyle,
																	styles.unseenPassageWord,
																]}
															>
																{text}
															</Animated.Text>
															<Animated.Text
																accessible={false}
																style={[
																	styles.unseenWordQuestion,
																	{
																		color: progressColor,
																		opacity: unseenQuestionOpacity,
																	},
																]}
															>
																?
															</Animated.Text>
														</View>
													:	<Animated.Text style={[styles.passageWord, progressStyle]}>
															{text}
														</Animated.Text>
													}
													{spaceMaybeButNotAlways}
												</Text>
											);
										})}
								</Text>
							</View>
						</ScrollView>
						<View style={styles.modalFooter}>
							<Text style={[styles.progressTitle, { color: deck.colors.dark.primary }]}>
								Word Progress Colors
							</Text>
							<View style={styles.progressLegend}>
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
												styles.progressLegendItem,
												isActive && {
													backgroundColor: `${progressColor}33`,
													borderColor: `${progressColor}66`,
												},
											]}
										>
											<View
												style={[styles.progressLegendDot, { backgroundColor: progressColor }]}
											/>
											<Text style={styles.progressLegendText}>{name}</Text>
											<Text style={styles.progressLegendText}>({wordCount})</Text>
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
					style={styles.hidePassageButton}
				>
					<MaterialIcons
						name="menu-book"
						size={20}
						color={deck.colors.dark.primary}
					/>
					<Text style={[styles.hidePassageButtonText, { color: deck.colors.dark.primary }]}>
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
	header: {
		padding: 8,
		gap: 4,
	},
	placeContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
	placeText: {
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	title: {
		fontSize: 24,
		fontFamily: 'lexend-600',
	},
	progressMeta: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	progressMetaLabel: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	progressPercent: {
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	progressBarContainer: {
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
	progressBar: {
		height: '100%',
		borderRadius: 4,
	},
	wordsSeen: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	modalScrollView: {
		paddingHorizontal: 16,
		maxHeight: 320,
		borderColor: colors.light.goldenBorder,
		borderTopWidth: 1,
		borderBottomWidth: 1,
	},
	modalTextContainer: {
		position: 'relative',
	},
	modalTextRules: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	modalTextRule: {
		position: 'absolute',
		left: 0,
		right: 0,
		borderBottomWidth: 1,
		borderColor: '#D7CDC4',
	},
	modalText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	passageWord: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 28,
	},
	unseenPassageWord: {
		color: 'transparent',
	},
	unseenWordContainer: {
		position: 'relative',
		flexDirection: 'row',
	},
	unseenWordQuestion: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		color: colors.wordProgress.new,
		fontFamily: 'lexend-600',
		fontSize: 14,
		lineHeight: 28,
		marginTop: 3,
		borderBottomWidth: 1,
		textAlign: 'center',
	},
	modalFooter: {
		paddingVertical: 8,
		marginBottom: 8,
		paddingHorizontal: 8,
		gap: 8,
	},
	progressTitle: {
		fontSize: 14,
		fontFamily: 'lexend-600',
		textAlign: 'left',
		color: colors.dark.text,
	},
	progressLegend: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 4,
	},
	progressLegendItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 4,
		paddingHorizontal: 4,
		paddingVertical: 6,
		flexGrow: 1,
		flexShrink: 1,
		gap: 4,
	},
	progressLegendDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	progressLegendText: {
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
		gap: 8,
	},
	hidePassageButtonText: {
		fontSize: 14,
		fontFamily: 'lexend-600',
	},
});
