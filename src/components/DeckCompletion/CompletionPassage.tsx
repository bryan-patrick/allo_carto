import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { DeckWordResultProps } from '@/src/components/CardDeck/deckSessionTypes';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { getCompletionEntry } from './completionAnimations';

/**
 * Typing
 */
interface CompletionPassageProps {
	deck: CardDeck;
	results: DeckWordResultProps[];
}

const titleEntry = getCompletionEntry(1);
const passageEntry = getCompletionEntry(2);
const descriptionEntry = getCompletionEntry(3);
const legendEntry = getCompletionEntry(4);

/**
 * Show the complete passage with only this deck review's words highlighted
 */
export default function CompletionPassage({ deck, results }: CompletionPassageProps) {
	const resultsByWordId = new Map(results.map(result => [result.wordId, result]));

	const segments = deck.passage.map(({ text, wordId, unlockExempt, after }, index) => {
		const wordResults = resultsByWordId.get(wordId ?? '');
		let backgroundColor: string | undefined;
		let accessibilityLabel = text;

		if (wordResults && !unlockExempt) {
			if (wordResults.outcome === 'correct') {
				backgroundColor = colors.light.success;
				accessibilityLabel = `${text}, correct`;
			} else {
				backgroundColor = `${colors.light.danger}33`;
				accessibilityLabel = `${text}, ${wordResults.outcome}`;
			}
		}

		return {
			key: `${index}-${wordId ?? text}`,
			text,
			after: after ?? ' ',
			style: { backgroundColor },
			accessibilityLabel,
		};
	});

	return (
		<View style={styles.container}>
			<Animated.Text
				entering={titleEntry}
				style={styles.title}
			>
				Read the passage again
			</Animated.Text>
			<Animated.View
				entering={passageEntry}
				style={styles.passage}
			>
				<Text style={styles.passageText}>
					{segments.map(segment => (
						<Fragment key={segment.key}>
							<Text
								accessibilityLabel={segment.accessibilityLabel}
								style={segment.style}
							>
								{segment.text}
							</Text>
							{segment.after}
						</Fragment>
					))}
				</Text>
			</Animated.View>
			<Animated.Text
				entering={descriptionEntry}
				style={styles.description}
			>
				The words you studied in this run are highlighted.
			</Animated.Text>
			<Animated.View
				entering={legendEntry}
				style={styles.legend}
			>
				<View style={[styles.legendItem, styles.correct]}>
					<MaterialSymbol
						name="check"
						size={14}
						color={colors.dark.success}
					/>
					<Text style={styles.legendText}>Correct</Text>
				</View>
				<View style={[styles.legendItem, styles.incorrect]}>
					<MaterialSymbol
						name="close"
						size={14}
						color={colors.dark.danger}
					/>
					<Text style={styles.legendText}>Incorrect / skipped</Text>
				</View>
			</Animated.View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: { gap: 8 },
	title: {
		fontFamily: 'lexend-600',
		fontSize: 15,
		color: colors.dark.text,
	},
	description: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
		color: colors.dark.text,
	},
	legend: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		borderRadius: 4,
		paddingHorizontal: 6,
		paddingVertical: 3,
	},
	legendText: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		color: colors.dark.text,
	},
	correct: { backgroundColor: colors.light.success },
	incorrect: { backgroundColor: `${colors.light.danger}33` },
	passage: {
		backgroundColor: `${colors.light.primary}55`,
		borderColor: colors.light.goldenBorder,
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
	},
	passageText: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: 25,
		color: colors.dark.text,
	},
});
