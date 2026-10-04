import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getDeckCompletionPercent } from '@/src/util/deckCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { type WordProgressKey, wordProgressDefinitions } from '@/src/util/wordProgress';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

/**
 * Typing
 */
interface DeckPassageViewProps {
	currentWordId?: string;
	deck: CardDeck;
	onContentHeightChange?: (contentHeight: number) => void;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

interface PassageLineMetric {
	y: number;
	height: number;
}

interface PassageHeightMeasurements {
	footer: number;
	header: number;
	passage: number;
}

/**
 * Constants
 */
const learningLevelOpacity: Record<WordProgressKey, number> = {
	unseen: 0.2,
	new: 0.4,
	learning: 0.6,
	familiar: 0.8,
	known: 1,
	mastered: 1,
};
const filteredOutWordOpacity = 0.05;

/**
 * Helper functions
 */
function getPassageWordOpacity(
	progress: WordProgressKey,
	filter: WordProgressKey | null,
	useLevelOpacity: boolean,
): number {
	if (filter) {
		if (progress === filter) return 1;
		return filteredOutWordOpacity;
	}

	if (useLevelOpacity) return learningLevelOpacity[progress];
	return 1;
}

function getLearningLevelColor(progress: WordProgressKey, useLearningLevelColors: boolean): string {
	if (useLearningLevelColors) return colors.wordProgress[progress];
	return colors.dark.text;
}

function createWordProgressOpacityValues(
	useLevelOpacity: boolean,
): Record<WordProgressKey, Animated.Value> {
	return {
		unseen: new Animated.Value(getPassageWordOpacity('unseen', null, useLevelOpacity)),
		new: new Animated.Value(getPassageWordOpacity('new', null, useLevelOpacity)),
		learning: new Animated.Value(getPassageWordOpacity('learning', null, useLevelOpacity)),
		familiar: new Animated.Value(getPassageWordOpacity('familiar', null, useLevelOpacity)),
		known: new Animated.Value(getPassageWordOpacity('known', null, useLevelOpacity)),
		mastered: new Animated.Value(getPassageWordOpacity('mastered', null, useLevelOpacity)),
	};
}

function getPassageTrailingText(after?: string): string {
	const trailingText = after ?? ' ';

	/**
	 * Add a thin space after word gaps but leave punctuation alone.
	 */
	if (trailingText.endsWith(' ')) {
		return `${trailingText}\u2009`;
	} else {
		return trailingText;
	}
}

/**
 * DeckPassageView component
 */
export default function DeckPassageView({
	currentWordId,
	deck,
	onContentHeightChange,
	wordProgressCounts,
	wordProgressKeyByWordId,
}: DeckPassageViewProps) {
	const {
		settings: { useLearningLevelColors, useLevelOpacity },
		setSetting,
	} = useAppSettings();
	/**
	 * State
	 */
	const [passageLineMetrics, setPassageLineMetrics] = useState<PassageLineMetric[]>([]);
	const [activeWordProgressFilter, setActiveWordProgressFilter] = useState<WordProgressKey | null>(
		null,
	);
	const [wordProgressOpacityByKey] = useState(() =>
		createWordProgressOpacityValues(useLevelOpacity),
	);
	const [exemptWordOpacity] = useState(() => new Animated.Value(1));
	const passageHeightMeasurements = useRef<PassageHeightMeasurements>({
		footer: 0,
		header: 0,
		passage: 0,
	});
	const hasReportedContentHeight = useRef(false);

	/**
	 * Passage metadata
	 */
	const totalWordCount = deck.wordIds.length;
	const storyColor = getDeckStoryColor(deck.id);
	const progressLegendTextColor = getLearningLevelColor('known', useLearningLevelColors);
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
	 * Get the rendered height for the modal
	 */
	function handleHeightMeasurement(section: keyof PassageHeightMeasurements, height: number) {
		passageHeightMeasurements.current[section] = height;

		const { footer, header, passage } = passageHeightMeasurements.current;
		const contentHeight = footer + header + passage;

		if (!footer || !header || !passage || hasReportedContentHeight.current) {
			return;
		}

		hasReportedContentHeight.current = true;
		onContentHeightChange?.(contentHeight);
	}

	/**
	 * Highlight one word progress group at a time
	 */
	function handleWordProgressFilterPress(progress: WordProgressKey) {
		let nextProgress: WordProgressKey | null = progress;

		/**
		 * Toggle the filter
		 */
		if (activeWordProgressFilter === progress) {
			nextProgress = null;
		}

		setActiveWordProgressFilter(nextProgress);
	}

	/**
	 * Respond to changes from either the passage toggles or Settings.
	 */
	useEffect(() => {
		const animation = Animated.parallel(
			[
				...wordProgressDefinitions.map(({ key }) =>
					Animated.timing(wordProgressOpacityByKey[key], {
						toValue: getPassageWordOpacity(key, activeWordProgressFilter, useLevelOpacity),
						duration: 120,
						useNativeDriver: true,
					}),
				),
				Animated.timing(exemptWordOpacity, {
					toValue: activeWordProgressFilter ? filteredOutWordOpacity : 1,
					duration: 120,
					useNativeDriver: true,
				}),
			],
			{ stopTogether: false },
		);
		animation.start();
		return () => animation.stop();
	}, [activeWordProgressFilter, useLevelOpacity, wordProgressOpacityByKey, exemptWordOpacity]);

	/**
	 * Render the passage
	 */
	return (
		<View style={styles.passageView}>
			<View
				onLayout={({ nativeEvent }) => handleHeightMeasurement('header', nativeEvent.layout.height)}
				style={styles.header}
			>
				<Text style={[styles.title, { color: storyColor }]}>{deck.title}</Text>
				<View
					accessible
					accessibilityLabel={`Word progress ${deckCompletionPercent} percent. ${wordsSeenCount} of ${totalWordCount} seen.`}
					accessibilityRole="progressbar"
					accessibilityValue={{ min: 0, max: 100, now: deckCompletionPercent }}
					style={styles.progressMeta}
				>
					<Text style={styles.progressLabel}>Words known</Text>
					<Text style={[styles.progressPercent, { color: storyColor }]}>
						{deckCompletionPercent}%
					</Text>
					<View style={styles.progressBarContainer}>
						<View
							style={[
								styles.progressBar,
								{
									backgroundColor: storyColor,
									width: `${deckCompletionPercent}%`,
								},
							]}
						/>
					</View>
					<Text style={styles.wordsSeen}>
						{wordsSeenCount} / {totalWordCount} seen
					</Text>
				</View>
				<View style={styles.passageToggles}>
					<View style={styles.learningLevelToggle}>
						<Text style={styles.learningLevelColorsLabel}>
							Use level&nbsp;
							<Text style={styles.learningLevelColorsWord}>
								<Text style={{ color: colors.dark.text }}>c</Text>
								<Text style={{ color: colors.wordProgress.new }}>o</Text>
								<Text style={{ color: colors.wordProgress.learning }}>l</Text>
								<Text style={{ color: colors.wordProgress.familiar }}>o</Text>
								<Text style={{ color: colors.wordProgress.known }}>r</Text>
								<Text style={{ color: colors.wordProgress.mastered }}>s</Text>
							</Text>
						</Text>
						<View style={styles.learningLevelColorsSwitchContainer}>
							<Switch
								accessibilityLabel="Use learning level colors"
								hitSlop={12}
								ios_backgroundColor={colors.light.border}
								onValueChange={enabled => setSetting('useLearningLevelColors', enabled)}
								style={styles.learningLevelColorsSwitch}
								trackColor={{ false: colors.light.border, true: storyColor }}
								value={useLearningLevelColors}
							/>
						</View>
					</View>
					<View style={styles.learningLevelToggle}>
						<Text style={styles.learningLevelColorsLabel}>Use level opacity</Text>
						<View style={styles.learningLevelColorsSwitchContainer}>
							<Switch
								accessibilityLabel="Use level opacity"
								hitSlop={12}
								ios_backgroundColor={colors.light.border}
								onValueChange={enabled => setSetting('useLevelOpacity', enabled)}
								style={styles.learningLevelColorsSwitch}
								trackColor={{ false: colors.light.border, true: storyColor }}
								value={useLevelOpacity}
							/>
						</View>
					</View>
				</View>
			</View>

			<ScrollView
				indicatorStyle="black"
				onContentSizeChange={(_width, height) => handleHeightMeasurement('passage', height)}
				persistentScrollbar
				showsVerticalScrollIndicator
				style={styles.passageScrollView}
			>
				<View style={styles.passageTextContainer}>
					<View
						accessible={false}
						pointerEvents="none"
						style={styles.passageTextRules}
					>
						{passageLineMetrics.map(({ y, height }, index) => (
							<View
								key={index}
								style={[styles.passageTextRule, { top: y + height }]}
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

								if (metricsAreUnchanged) return currentMetrics;
								return nextMetrics;
							});
						}}
					>
						{deck.passage.map(({ text, wordId, unlockExempt, after }, index) => {
							const key = `${index}-${wordId ?? text}`;
							const isCurrentWord = Boolean(
								currentWordId && wordId === currentWordId && !unlockExempt,
							);
							const trailingText = getPassageTrailingText(after);
							const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';
							let displayProgress = progress;
							let displayText = text;
							let opacity = wordProgressOpacityByKey[progress];

							if (unlockExempt) {
								displayProgress = 'known';
								opacity = exemptWordOpacity;
							} else if (progress === 'unseen') {
								displayText = '?';
								opacity = new Animated.Value(0.2);
							}

							const wordColor = getLearningLevelColor(displayProgress, useLearningLevelColors);
							let backgroundColor: string | undefined;
							let displayOpacity: number | Animated.Value = opacity;

							if (isCurrentWord) {
								backgroundColor = '#FFFFAAFF';
								displayOpacity = 1;
							}

							const progressStyle = {
								backgroundColor,
								color: wordColor,
								opacity: displayOpacity,
							};

							/**
							 * Render the individual word
							 */
							return (
								<Text
									key={key}
									style={styles.passageText}
								>
									<Animated.Text
										testID={`passage-word-${index}`}
										style={[styles.passageWord, progressStyle]}
									>
										{displayText}
									</Animated.Text>
									{trailingText}
								</Text>
							);
						})}
					</Text>
				</View>
			</ScrollView>

			<View
				onLayout={({ nativeEvent }) => handleHeightMeasurement('footer', nativeEvent.layout.height)}
				style={styles.footer}
			>
				<View style={styles.progressLegend}>
					{wordProgressDefinitions.map(({ key, name, symbolName }) => {
						const progressColor = getLearningLevelColor(key, useLearningLevelColors);
						const isActive = activeWordProgressFilter === key;
						const wordCount = wordProgressCounts[key];
						let wordCountLabel = 'words';

						if (wordCount === 1) {
							wordCountLabel = 'word';
						}

						/**
						 * Render the filter
						 */
						return (
							<Pressable
								key={key}
								accessibilityLabel={`${name}, ${wordCount} ${wordCountLabel}`}
								accessibilityRole="radio"
								accessibilityState={{ checked: isActive }}
								onPress={() => handleWordProgressFilterPress(key)}
								style={[
									styles.progressLegendItem,
									isActive && {
										backgroundColor: `${progressColor}26`,
										borderColor: `${progressColor}99`,
									},
								]}
							>
								<MaterialSymbol
									color={progressColor}
									name={symbolName}
									size={16}
									style={styles.progressLegendIcon}
								/>
								<Text style={[styles.progressLegendText, { color: progressLegendTextColor }]}>
									{name}
								</Text>
								<Text style={[styles.progressLegendText, { color: progressLegendTextColor }]}>
									({wordCount})
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	passageView: {
		flex: 1,
		minHeight: 0,
	},
	header: {
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 2,
		paddingBottom: 12,
		paddingHorizontal: 16,
		paddingTop: 12,
		gap: 8,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		lineHeight: 20,
	},
	progressMeta: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	progressLabel: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	progressPercent: {
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
	progressBarContainer: {
		backgroundColor: '#00000014',
		borderColor: colors.light.border,
		borderRadius: 4,
		borderWidth: 1,
		flex: 1,
		height: 8,
		overflow: 'hidden',
	},
	progressBar: {
		borderRadius: 4,
		height: '100%',
	},
	wordsSeen: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	passageToggles: {
		flexDirection: 'row',
		gap: 16,
		width: '100%',
	},
	learningLevelToggle: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	learningLevelColorsLabel: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	learningLevelColorsWord: {
		fontFamily: 'lexend-700',
	},
	learningLevelColorsSwitchContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	learningLevelColorsSwitch: {
		transform: [{ scale: 0.65 }, { translateX: '-35%' }],
	},
	passageScrollView: {
		flex: 1,
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 2,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	passageTextContainer: {
		position: 'relative',
		paddingVertical: 8,
		minHeight: 300,
	},
	passageTextRules: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
	},
	passageTextRule: {
		position: 'absolute',
		borderBottomColor: '#CFC1AD',
		borderBottomWidth: 1,
		left: 0,
		right: 0,
	},
	passageText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 32,
	},
	passageWord: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 32,
	},
	unseenPassageWord: {
		color: 'transparent',
	},
	unseenWordContainer: {
		flexDirection: 'row',
		height: 16,
		position: 'relative',
	},
	unseenWordQuestion: {
		fontFamily: 'lexend-600',
		fontSize: 16,
		left: 0,
		lineHeight: 16,
		position: 'absolute',
		right: 0,
		textAlign: 'center',
		top: 0,
		transform: [{ translateY: 8 }],
	},
	footer: {
		paddingHorizontal: 8,
		paddingTop: 8,
	},
	progressLegend: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
	},
	progressLegendItem: {
		alignItems: 'center',
		backgroundColor: 'rgba(246, 229, 201, 0.55)',
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		borderWidth: 1,
		flexDirection: 'row',
		flexGrow: 1,
		flexShrink: 1,
		gap: 4,
		justifyContent: 'center',
		minWidth: '40%',
		paddingHorizontal: 4,
		paddingVertical: 6,
	},
	progressLegendIcon: {
		width: 18,
	},
	progressLegendText: {
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
});
