import colors from '@/src/app/colors';
import type { PassageSegment, ReadingPassage } from '@/src/components/CardDeck/cardDeckTypes';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import PassageHighlightLayer from '@/src/components/PassageHighlightLayer';
import ProgressBar from '@/src/components/ProgressBar';
import TTSButton from '@/src/components/TTSButton';
import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getDeckCompletionPercent } from '@/src/util/deckCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { type WordProgressKey, wordProgressDefinitions } from '@/src/util/wordProgress';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

/*
 * Typing
 */
interface DeckPassageViewProps {
	currentWordId?: string;
	deck: ReadingPassage;
	onContentHeightChange?: (contentHeight: number) => void;
	showLearningControls?: boolean;
	showProgress?: boolean;
	showTitle?: boolean;
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

interface PassageWordRange {
	start: number;
	end: number;
}

interface PassageSpeech {
	text: string;
	wordRanges: PassageWordRange[];
}

/*
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
const passageLineHeight = 32;
const passageHighlightVerticalInset = 2;
const passageTextVerticalPadding = 12;

/*
 * Helper functions
 */
function getPassageWordOpacity(
	progress: WordProgressKey,
	filter: WordProgressKey | null,
	useLevelOpacity: boolean,
	showUnseenWords: boolean,
): number {
	if (filter) {
		if (progress === filter) {
			return 1;
		}

		return filteredOutWordOpacity;
	}

	if (progress === 'unseen' && !showUnseenWords) {
		return learningLevelOpacity.unseen;
	}

	if (useLevelOpacity) {
		return learningLevelOpacity[progress];
	}

	return 1;
}

function getLearningLevelColor(progress: WordProgressKey, useLearningLevelColors: boolean): string {
	if (useLearningLevelColors) return colors.wordProgress[progress];
	return colors.dark.text;
}

function createWordProgressOpacityValues(
	useLevelOpacity: boolean,
	showUnseenWords: boolean,
): Record<WordProgressKey, Animated.Value> {
	const unseenOpacity = getPassageWordOpacity('unseen', null, useLevelOpacity, showUnseenWords);
	const newOpacity = getPassageWordOpacity('new', null, useLevelOpacity, showUnseenWords);
	const learningOpacity = getPassageWordOpacity('learning', null, useLevelOpacity, showUnseenWords);
	const familiarOpacity = getPassageWordOpacity('familiar', null, useLevelOpacity, showUnseenWords);
	const knownOpacity = getPassageWordOpacity('known', null, useLevelOpacity, showUnseenWords);
	const masteredOpacity = getPassageWordOpacity('mastered', null, useLevelOpacity, showUnseenWords);

	return {
		unseen: new Animated.Value(unseenOpacity),
		new: new Animated.Value(newOpacity),
		learning: new Animated.Value(learningOpacity),
		familiar: new Animated.Value(familiarOpacity),
		known: new Animated.Value(knownOpacity),
		mastered: new Animated.Value(masteredOpacity),
	};
}

function getPassageTrailingText(after?: string): string {
	const trailingText = after ?? ' ';

	/*
	 * Add a thin space after word gaps
	 */
	if (trailingText.endsWith(' ')) {
		return `${trailingText}\u2009`;
	} else {
		return trailingText;
	}
}

/*
 * Check if the current word should be visible
 */
function isPassageWordVisible(
	progress: WordProgressKey,
	unlockExempt: boolean | undefined,
	showUnseenWords: boolean,
): boolean {
	if (unlockExempt || showUnseenWords) {
		return true;
	}

	return progress !== 'unseen';
}

/*
 * Each word keeps its place in that text so the highlight follows the voice.
 * We return an object, because we're insane.
 */
function getPassageSpeech(
	passage: PassageSegment[],
	wordProgressKeyByWordId: Record<string, WordProgressKey>,
	showUnseenWords: boolean,
): PassageSpeech {
	let text = '';

	const wordRanges = passage.map(segment => {
		const progress = wordProgressKeyByWordId[segment.wordId ?? ''] ?? 'unseen';
		const isVisible = isPassageWordVisible(progress, segment.unlockExempt, showUnseenWords);
		const start = text.length;
		let end = start;

		if (isVisible) {
			text += segment.text;
		}

		end = text.length;
		text += segment.after ?? ' ';

		return { start, end };
	});

	return { text, wordRanges };
}

/*
 * DeckPassageView component
 */
export default function DeckPassageView({
	currentWordId,
	deck,
	onContentHeightChange,
	showLearningControls = true,
	showProgress = true,
	showTitle = true,
	wordProgressCounts,
	wordProgressKeyByWordId,
}: DeckPassageViewProps) {
	const {
		settings: { useLearningLevelColors, useLevelOpacity, showUnseenWords },
		setSetting,
	} = useAppSettings();
	/*
	 * State
	 */
	const [passageLineMetrics, setPassageLineMetrics] = useState<PassageLineMetric[]>([]);
	const [spokenCharacterIndex, setSpokenCharacterIndex] = useState<number | null>(null);
	const [areFiltersExpanded, setAreFiltersExpanded] = useState(false);
	const passageSpeech = useMemo(
		() => getPassageSpeech(deck.passage, wordProgressKeyByWordId, showUnseenWords),
		[deck.passage, wordProgressKeyByWordId, showUnseenWords],
	);
	const [activeWordProgressFilter, setActiveWordProgressFilter] = useState<WordProgressKey | null>(
		null,
	);
	const [wordProgressOpacityByKey] = useState(() =>
		createWordProgressOpacityValues(useLevelOpacity, showUnseenWords),
	);
	const [exemptWordOpacity] = useState(() => new Animated.Value(1));
	const passageHeightMeasurements = useRef<PassageHeightMeasurements>({
		footer: 0,
		header: 0,
		passage: 0,
	});
	const hasReportedContentHeight = useRef(false);
	const hasPassageHeader = showTitle || showProgress || showLearningControls;

	/*
	 * Share the exact text and typography between foreground and background.
	 */
	const passageSegments = deck.passage.map(({ text, wordId, unlockExempt, after }, index) => {
		const key = `${index}-${wordId ?? text}`;
		const isCurrentWord = Boolean(currentWordId && wordId === currentWordId && !unlockExempt);
		const range = passageSpeech.wordRanges[index];
		const isSpokenWord =
			spokenCharacterIndex !== null &&
			spokenCharacterIndex >= range.start &&
			spokenCharacterIndex < range.end;
		const trailingText = getPassageTrailingText(after);
		const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';
		const isVisible = isPassageWordVisible(progress, unlockExempt, showUnseenWords);
		let displayProgress = progress;
		let displayText = text;
		let opacity = wordProgressOpacityByKey[progress];
		let wordColor: string;
		let backgroundColor: string | undefined;
		let displayOpacity: number | Animated.Value;

		if (unlockExempt) {
			displayProgress = 'known';
			opacity = exemptWordOpacity;
		} else if (!isVisible) {
			displayText = '?';
		}

		wordColor = getLearningLevelColor(displayProgress, useLearningLevelColors);
		displayOpacity = opacity;

		if (isCurrentWord) {
			backgroundColor = '#FFFFAAFF';
			displayOpacity = 1;
		}

		if (isSpokenWord) {
			backgroundColor = '#FFFFCC';
			displayOpacity = 1;
		}

		return {
			key,
			accessibilityLabel: displayText,
			displayText,
			trailingText,
			textStyle: { color: wordColor, opacity: displayOpacity },
			highlightStyle: { backgroundColor, opacity: displayOpacity },
		};
	});

	const hasPassageHighlights = passageSegments.some(
		segment => segment.highlightStyle.backgroundColor,
	);

	const speechButton = (
		<TTSButton
			accessibilityLabel="Read story aloud"
			disabled={!passageSpeech.wordRanges.some(range => range.end > range.start)}
			onBoundary={setSpokenCharacterIndex}
			onPlaybackEnd={() => setSpokenCharacterIndex(null)}
			stoppable
			wordsToSay={passageSpeech.text}
		/>
	);

	/*
	 * Passage metadata
	 */
	const totalWordCount = new Set(deck.wordIds).size;
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
	const completionText = `${deckCompletionPercent}% learned`;
	const seenText = `${wordsSeenCount}/${totalWordCount} words seen`;
	const completionAccessibilityLabel = `${deckCompletionPercent} percent learned`;
	const seenAccessibilityLabel = `${wordsSeenCount} of ${totalWordCount} words seen`;
	const completionAccessibilityValue = { min: 0, max: 100, now: deckCompletionPercent };
	const seenAccessibilityValue = { min: 0, max: totalWordCount, now: wordsSeenCount };
	let seenPercent = 0;

	if (totalWordCount > 0) {
		seenPercent = (wordsSeenCount / totalWordCount) * 100;
	}

	/*
	 * Get the rendered height for the modal
	 */
	function handleHeightMeasurement(section: keyof PassageHeightMeasurements, height: number) {
		passageHeightMeasurements.current[section] = height;

		const { footer, header, passage } = passageHeightMeasurements.current;
		let headerHeight = 0;

		if (hasPassageHeader) headerHeight = header;

		const contentHeight = footer + headerHeight + passage;
		const isHeaderMeasured = !hasPassageHeader || header > 0;

		if (!footer || !isHeaderMeasured || !passage || hasReportedContentHeight.current) {
			return;
		}

		hasReportedContentHeight.current = true;
		onContentHeightChange?.(contentHeight);
	}

	// Show or hide the filters and let the modal fit the new height.
	function handleToggleFilters() {
		hasReportedContentHeight.current = false;
		setAreFiltersExpanded(!areFiltersExpanded);
	}

	/*
	 * Highlight one word progress group at a time
	 */
	function handleWordProgressFilterPress(progress: WordProgressKey) {
		let nextProgress: WordProgressKey | null = progress;

		/*
		 * Toggle the filter
		 */
		if (activeWordProgressFilter === progress) {
			nextProgress = null;
		}

		setActiveWordProgressFilter(nextProgress);
	}

	/*
	 * Respond to changes from either the passage toggles or Settings.
	 */
	useEffect(() => {
		const animation = Animated.parallel(
			[
				...wordProgressDefinitions.map(({ key }) =>
					Animated.timing(wordProgressOpacityByKey[key], {
						toValue: getPassageWordOpacity(
							key,
							activeWordProgressFilter,
							useLevelOpacity,
							showUnseenWords,
						),
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
	}, [
		activeWordProgressFilter,
		useLevelOpacity,
		showUnseenWords,
		wordProgressOpacityByKey,
		exemptWordOpacity,
	]);

	/*
	 * Render the passage
	 */
	return (
		<View style={styles.passageView}>
			{hasPassageHeader && (
				<View
					onLayout={({ nativeEvent }) =>
						handleHeightMeasurement('header', nativeEvent.layout.height)
					}
					style={styles.header}
				>
					{showTitle && (
						<View style={styles.titleRow}>
							<Text style={[styles.title, { color: storyColor }]}>{deck.title}</Text>
							{speechButton}
						</View>
					)}
					{showProgress && (
						<View style={styles.progressMeta}>
							<View
								accessible
								accessibilityLabel={seenAccessibilityLabel}
								accessibilityRole="progressbar"
								accessibilityValue={seenAccessibilityValue}
								style={styles.progressColumn}
							>
								<Text style={styles.progressLabel}>{seenText}</Text>
								<ProgressBar
									color={storyColor}
									percent={seenPercent}
									style={styles.progressBarContainer}
								/>
							</View>
							<View style={styles.progressDivider} />
							<View
								accessible
								accessibilityLabel={completionAccessibilityLabel}
								accessibilityRole="progressbar"
								accessibilityValue={completionAccessibilityValue}
								style={styles.progressColumn}
							>
								<Text style={styles.progressLabel}>{completionText}</Text>
								<ProgressBar
									color={storyColor}
									percent={deckCompletionPercent}
									style={styles.progressBarContainer}
								/>
							</View>
						</View>
					)}
					{showLearningControls && (
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
					)}
				</View>
			)}

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
					<View style={styles.passageTextLayout}>
						{hasPassageHighlights && (
							<PassageHighlightLayer
								lineHeight={passageLineHeight}
								lineMetrics={passageLineMetrics}
								verticalInset={passageHighlightVerticalInset}
							>
								<Text style={[styles.passageText, styles.passageHighlightText]}>
									{passageSegments.map(segment => (
										<Text
											key={segment.key}
											style={styles.passageText}
										>
											<Animated.Text
												style={[
													styles.passageWord,
													styles.passageHighlightText,
													segment.highlightStyle,
												]}
											>
												{segment.displayText}
											</Animated.Text>
											<Text style={styles.passageHighlightText}>{segment.trailingText}</Text>
										</Text>
									))}
								</Text>
							</PassageHighlightLayer>
						)}
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
							{passageSegments.map((segment, index) => (
								<Text
									key={segment.key}
									style={styles.passageText}
								>
									<Animated.Text
										accessibilityLabel={segment.accessibilityLabel}
										testID={`passage-word-${index}`}
										style={[styles.passageWord, segment.textStyle]}
									>
										{segment.displayText}
									</Animated.Text>
									{segment.trailingText}
								</Text>
							))}
						</Text>
					</View>
				</View>
			</ScrollView>

			<View
				onLayout={({ nativeEvent }) => handleHeightMeasurement('footer', nativeEvent.layout.height)}
				style={styles.footer}
			>
				{showLearningControls && (
					<Pressable
						accessibilityRole="button"
						accessibilityState={{
							expanded: areFiltersExpanded,
						}}
						onPress={handleToggleFilters}
						style={styles.filterAccordionHeader}
					>
						<Text style={styles.filterAccordionTitle}>Filters</Text>
						<MaterialSymbol
							color={colors.dark.text}
							name={areFiltersExpanded ? 'expand_less' : 'expand_more'}
							size={20}
						/>
					</Pressable>
				)}
				{showLearningControls && areFiltersExpanded && (
					<View style={styles.progressLegend}>
						{wordProgressDefinitions.map(({ key, name, symbolName }) => {
							const progressColor = getLearningLevelColor(key, useLearningLevelColors);
							const isActive = activeWordProgressFilter === key;
							const wordCount = wordProgressCounts[key];
							let wordCountLabel = 'words';

							if (wordCount === 1) {
								wordCountLabel = 'word';
							}

							/*
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
				)}
			</View>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	passageView: {
		flex: 1,
		minHeight: 0,
	},
	header: {
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 1,
		paddingBottom: 12,
		paddingHorizontal: 16,
		paddingTop: 12,
		gap: 8,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 20,
		lineHeight: 20,
	},
	progressMeta: {
		flexDirection: 'row',
		gap: 12,
	},
	progressColumn: {
		flex: 1,
		minWidth: 0,
		gap: 4,
	},
	progressDivider: {
		backgroundColor: colors.light.border,
		width: 1,
	},
	progressLabel: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	progressBarContainer: {
		backgroundColor: '#00000014',
		borderColor: colors.light.border,
		borderRadius: 4,
		borderWidth: 1,
		height: 6,
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
		backgroundColor: '#FFFCF7',
		flex: 1,
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	passageTextContainer: {
		position: 'relative',
		minHeight: 180,
		paddingVertical: passageTextVerticalPadding,
	},
	passageTextRules: {
		position: 'absolute',
		bottom: passageTextVerticalPadding,
		left: 0,
		right: 0,
		top: passageTextVerticalPadding,
	},
	passageTextRule: {
		position: 'absolute',
		borderBottomColor: '#CFC1AD',
		borderBottomWidth: 1,
		left: 0,
		right: 0,
	},
	passageTextLayout: { position: 'relative' },
	passageHighlightText: { color: 'transparent' },
	passageText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: passageLineHeight,
	},
	passageWord: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: passageLineHeight,
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
		lineHeight: 16,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		textAlign: 'center',
		transform: [{ translateY: 8 }],
	},
	footer: {
		paddingHorizontal: 8,
		paddingTop: 8,
	},
	filterAccordionHeader: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		minHeight: 40,
		paddingHorizontal: 8,
	},
	filterAccordionTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	progressLegend: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
	},
	progressLegendItem: {
		alignItems: 'center',
		backgroundColor: '#FFFCF7',
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
		paddingVertical: 3,
	},
	progressLegendIcon: {
		width: 18,
	},
	progressLegendText: {
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
});
