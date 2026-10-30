import colors from '@/src/app/colors';
import type { ReadingPassage } from '@/src/components/CardDeck/cardDeckTypes';
import type { DeckWordResultProps } from '@/src/components/CardDeck/deckSessionTypes';
import PassageHighlightLayer from '@/src/components/PassageHighlightLayer';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/*
 * Typing
 */
interface CompletionPassageProps {
	deck: ReadingPassage;
	results: DeckWordResultProps[];
}

interface PassageLineMetric {
	y: number;
	height: number;
}

const passageLineHeight = 24;
const resultColors: Record<DeckWordResultProps['outcome'], string> = {
	correct: colors.light.success,
	incorrect: `${colors.light.danger}33`,
	skipped: `${colors.light.danger}33`,
};

/*
 * Show the paragraph with this session's correct and incorrect words highlighted.
 */
export default function CompletionPassage({ deck, results }: CompletionPassageProps) {
	const [lineMetrics, setLineMetrics] = useState<PassageLineMetric[]>([]);
	const correctCount = results.filter(result => result.outcome === 'correct').length;
	const incorrectCount = results.length - correctCount;
	const resultsByWordId = new Map(results.map(result => [result.wordId, result]));
	const segments = deck.passage.map((segment, index) => {
		const result = segment.unlockExempt ? undefined : resultsByWordId.get(segment.wordId ?? '');
		const accessibilityLabel = result ? `${segment.text}, ${result.outcome}` : segment.text;
		const highlightStyle = {
			backgroundColor: result ? resultColors[result.outcome] : undefined,
		};

		return {
			key: String(index),
			text: segment.text,
			trailingText: segment.after ?? ' ',
			accessibilityLabel,
			highlightStyle,
		};
	});
	const hasHighlights = segments.some(segment => segment.highlightStyle.backgroundColor);

	if (segments.length === 0) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.paragraphLayout}>
				{hasHighlights && (
					<PassageHighlightLayer
						lineHeight={passageLineHeight}
						lineMetrics={lineMetrics}
						verticalInset={2}
					>
						<Text style={[styles.paragraph, styles.highlightText]}>
							{segments.map(segment => (
								<Text key={segment.key}>
									<Text style={segment.highlightStyle}>{segment.text}</Text>
									{segment.trailingText}
								</Text>
							))}
						</Text>
					</PassageHighlightLayer>
				)}
				<Text
					style={styles.paragraph}
					onTextLayout={({ nativeEvent }) => {
						const nextMetrics = nativeEvent.lines.map(line => ({
							y: line.y,
							height: line.height,
						}));

						setLineMetrics(currentMetrics => {
							const unchanged =
								currentMetrics.length === nextMetrics.length &&
								currentMetrics.every((metric, index) => {
									return (
										metric.y === nextMetrics[index].y && metric.height === nextMetrics[index].height
									);
								});

							if (unchanged) {
								return currentMetrics;
							}

							return nextMetrics;
						});
					}}
				>
					{segments.map(segment => (
						<Text key={segment.key}>
							<Text accessibilityLabel={segment.accessibilityLabel}>{segment.text}</Text>
							{segment.trailingText}
						</Text>
					))}
				</Text>
			</View>
			<View style={styles.legend}>
				<Text style={[styles.legendLabel, styles.correct]}>Correct ({correctCount})</Text>
				<Text style={[styles.legendLabel, styles.incorrect]}>
					Incorrect / skipped ({incorrectCount})
				</Text>
			</View>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		gap: 4,
	},
	paragraphLayout: {
		position: 'relative',
	},
	paragraph: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: passageLineHeight,
		color: colors.dark.text,
	},
	highlightText: {
		color: 'transparent',
	},
	legend: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	legendLabel: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		color: colors.dark.text,
		paddingHorizontal: 4,
		paddingVertical: 2,
		borderRadius: 2,
		marginTop: 6,
	},
	correct: {
		backgroundColor: resultColors.correct,
	},
	incorrect: {
		backgroundColor: resultColors.incorrect,
	},
});
