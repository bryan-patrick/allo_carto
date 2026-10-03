import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { getDeckCompletionPercent } from '@/src/util/deckCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { type WordProgressKey, wordProgressDefinitions } from '@/src/util/wordProgress';
import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface DeckPassageViewProps {
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

function getPassageTrailingText(after?: string): string {
	const trailingText = after ?? ' ';

	return trailingText.endsWith(' ') ? `${trailingText}\u2009` : trailingText;
}

/**
 * DeckPassageView component
 */
export default function DeckPassageView({
	deck,
	onContentHeightChange,
	wordProgressCounts,
	wordProgressKeyByWordId,
}: DeckPassageViewProps) {
	/**
	 * State
	 */
	const [passageLineMetrics, setPassageLineMetrics] = useState<PassageLineMetric[]>([]);
	const [activeWordProgressFilter, setActiveWordProgressFilter] = useState<WordProgressKey | null>(
		null,
	);
	const [wordProgressOpacityByKey] = useState(createWordProgressOpacityValues);
	const [unseenQuestionOpacity] = useState(() => new Animated.Value(defaultUnseenQuestionOpacity));
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
	 * Report the passage's natural height to its modal
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

								return metricsAreUnchanged ? currentMetrics : nextMetrics;
							});
						}}
					>
						{deck.passage.map(({ text, wordId, unlockExempt, after }, index) => {
							const key = `${index}-${wordId ?? text}`;
							const trailingText = getPassageTrailingText(after);
							const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';
							const isUnseen = !unlockExempt && progress === 'unseen';
							const progressColor = colors.wordProgress[unlockExempt ? 'known' : progress];
							const progressStyle = {
								color: progressColor,
								opacity: unlockExempt ? 1 : wordProgressOpacityByKey[progress],
							};

							return (
								<Text
									key={key}
									style={styles.passageText}
								>
									{isUnseen ?
										<Animated.Text
											style={[
												styles.passageWord,
												{
													color: progressColor,
													opacity: unseenQuestionOpacity,
												},
											]}
										>
											?
										</Animated.Text>
									:	<Animated.Text style={[styles.passageWord, progressStyle]}>{text}</Animated.Text>
									}
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
						const progressColor = colors.wordProgress[key];
						const isActive = activeWordProgressFilter === key;
						const wordCount = wordProgressCounts[key];

						return (
							<Pressable
								key={key}
								accessibilityLabel={`${name}, ${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
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
								<Text style={styles.progressLegendText}>{name}</Text>
								<Text style={styles.progressLegendText}>({wordCount})</Text>
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
	passageScrollView: {
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 2,
		flex: 1,
		minHeight: 0,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	passageTextContainer: {
		position: 'relative',
		paddingVertical: 8,
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
		color: colors.wordProgress.known,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
});
