import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useRef, useState } from 'react';
import {
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
	dismissLabel?: string;
	embedded?: boolean;
	modalVisible: boolean;
	setModalVisible: (modalVisible: boolean) => void;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

interface PassageLineMetric {
	y: number;
	height: number;
}

const defaultUnseenQuestionOpacity = 0.25;

/**
 * Helper functions
 */
function getPassageWordOpacity(progress: WordProgressKey, filter: WordProgressKey | null): number {
	if (!filter) return progress === 'unseen' ? 0.25 : 1;

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
	dismissLabel = 'Hide passage',
	embedded = false,
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
	const [unseenQuestionOpacity] = useState(() => new Animated.Value(defaultUnseenQuestionOpacity));
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
			duration: 120,
			useNativeDriver: true,
		}).start();
	}

	function handleHidePassageButtonPressOut() {
		Animated.timing(hidePassageChevronTranslateY, {
			toValue: 0,
			duration: 120,
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
					toValue:
						nextProgress === null ? defaultUnseenQuestionOpacity
						: nextProgress === 'unseen' ? 1
						: 0.15,
					duration: 120,
					useNativeDriver: true,
				}),
			],
			{ stopTogether: false },
		).start();
	}

	/**
	 * Passage content shared by the standalone and embedded presentations
	 */
	const passageContent = (
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
						<View>
							<Text style={[styles.title, { color: deck.colors.dark.primary }]}>{deck.title}</Text>
						</View>
						<View
							style={styles.progressMeta}
							accessible={true}
							accessibilityRole="progressbar"
							accessibilityLabel={`Word progress ${deckCompletionPercent} percent. ${wordsSeenCount} of ${totalWordCount} seen.`}
							accessibilityValue={{ min: 0, max: 100, now: deckCompletionPercent }}
						>
							<Text style={styles.progressMetaLabel}>Words known</Text>
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
								{wordsSeenCount} / {totalWordCount} seen
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
															style={[styles.passageWord, progressStyle, styles.unseenPassageWord]}
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
						<View style={styles.progressLegend}>
							{wordProgressDefinitions.map(({ key, name, symbolName }) => {
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
										<MaterialSymbol
											name={symbolName}
											size={16}
											color={progressColor}
											style={styles.progressLegendIcon}
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
				accessibilityLabel={dismissLabel}
				onPress={() => setModalVisible(false)}
				onPressIn={handleHidePassageButtonPressIn}
				onPressOut={handleHidePassageButtonPressOut}
				style={styles.hidePassageButton}
			>
				<MaterialSymbol
					name={embedded ? 'arrow_back' : 'menu_book'}
					size={20}
					color={deck.colors.dark.primary}
				/>
				<Text style={[styles.hidePassageButtonText, { color: deck.colors.dark.primary }]}>
					{dismissLabel}
				</Text>
				{!embedded && (
					<Animated.View style={{ transform: [{ translateY: hidePassageChevronTranslateY }] }}>
						<MaterialSymbol
							name="expand_more"
							size={20}
							color={deck.colors.dark.primary}
						/>
					</Animated.View>
				)}
			</Pressable>
		</View>
	);

	/**
	 * The chapter deck picker owns the surrounding modal when embedded
	 */
	if (embedded) return modalVisible ? passageContent : null;

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
			onRequestClose={() => setModalVisible(false)}
		>
			{passageContent}
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
		shadowColor: colors.light.goldenBorder,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 1,
		shadowRadius: 1,
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
		paddingHorizontal: 16,
		paddingVertical: 8,
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
		justifyContent: 'center',
		borderWidth: 1,
		minWidth: '40%', // grid hack
		borderColor: colors.light.goldenBorder,
		borderRadius: 4,
		paddingHorizontal: 4,
		paddingVertical: 6,
		flexGrow: 1,
		flexShrink: 1,
		gap: 4,
	},
	progressLegendIcon: {
		width: 18,
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
		paddingHorizontal: 24,
		borderBottomRightRadius: 16,
		borderBottomLeftRadius: 16,
		borderColor: colors.light.goldenBorder,
		backgroundColor: colors.light.secondary,
		gap: 8,
	},
	hidePassageButtonText: {
		fontSize: 14,
		fontFamily: 'lexend-600',
	},
});
