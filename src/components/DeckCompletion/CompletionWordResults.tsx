import colors from '@/src/app/colors';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import type { DeckWordResultProps } from '@/src/components/CardDeck/deckSessionTypes';
import CountUp from '@/src/components/CountUp';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { WordProgressIcon } from '@/src/components/WordProgress';
import { userExperienceConfig } from '@/src/util/userExperience';
import {
	getWordProgressDefinitionByKey,
	type WordProgressDefinition,
} from '@/src/util/wordProgress';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import {
	completionEntryDuration,
	getCompletionDelay,
	getCompletionEntry,
} from './completionAnimations';

/**
 * Information needed to show each word's result.
 */
interface CompletionWordResultsProps {
	words: Word[];
	results: DeckWordResultProps[];
	color: string;
}

interface WordResultRowProps {
	word: Word;
	result: DeckWordResultProps;
	color: string;
	index: number;
}

/**
 * Show a word's earned XP and its old and new learning levels.
 */
function WordResultRow({ word, result, color, index }: WordResultRowProps) {
	/**
	 * Make each row appear after the row before it.
	 */
	const entering = getCompletionEntry(index + 1);

	/**
	 * Wait until the row appears before counting its XP.
	 */
	const countDelay = getCompletionDelay(index + 1) + completionEntryDuration;

	/**
	 * Get the saved bonus for raising this word's learning level.
	 * Use zero if there was no bonus. This bonus is already part of the word's total XP.
	 */
	const learningBonusXP = result.learningBonusXP ?? 0;

	/**
	 * Turn the bonus setting into a percent for the label.
	 * For example, a setting of 3 means a 300% bonus.
	 */
	const learningBonusPercent = userExperienceConfig.learningLevelBonusMultiplier * 100;

	const learningBonusLabel = `Level-up bonus (${learningBonusPercent}%)`;

	/**
	 * Start with an X and red colors for wrong or skipped words.
	 * Correct answers get a checkmark and green colors below.
	 */
	let symbolName = 'close';
	let iconColor = colors.dark.danger;
	let iconBackground = `${colors.light.danger}33`;
	let xpColor = colors.light.secondaryBorder;

	/**
	 * Join the English meanings into one line, with a comma between them.
	 */
	let translation = word.englishWords.join(', ');

	/**
	 * Keep the old and new learning levels here if the word changed levels.
	 */
	let learningChange:
		{ previous: WordProgressDefinition; next: WordProgressDefinition } | undefined;

	if (result.outcome === 'correct') {
		symbolName = 'check';
		iconColor = colors.dark.success;
		iconBackground = colors.light.success;
		xpColor = color;
	}

	/**
	 * Mark skipped words so the user can tell them apart from wrong answers.
	 */
	if (result.outcome === 'skipped') {
		translation += ' (skipped)';
	}

	/**
	 * If the learning level changed, find the names and icons for both levels.
	 */
	if (
		result.previousProgress &&
		result.nextProgress &&
		result.previousProgress !== result.nextProgress
	) {
		learningChange = {
			previous: getWordProgressDefinitionByKey(result.previousProgress),
			next: getWordProgressDefinitionByKey(result.nextProgress),
		};
	}

	/**
	 * xpLabel is the full XP text for screen readers.
	 * xpPrefix adds a plus sign to the counting number when XP was earned.
	 */
	let xpLabel = `${result.xp} XP`;
	let xpPrefix = '';

	if (result.xp > 0) {
		xpLabel = `+${result.xp} XP`;
		xpPrefix = '+';
	}

	/**
	 * Build the text a screen reader says for this word.
	 * Include the answer result, XP, language level, and any learning bonus or level change.
	 */
	let accessibilityLabel = `${word.frenchWord}. ${word.englishWords.join(', ')}. ${result.outcome}. ${xpLabel}. ${word.CEFR}.`;

	if (learningChange) {
		accessibilityLabel += ` ${learningChange.previous.name} to ${learningChange.next.name}.`;
	}
	if (learningBonusXP > 0) {
		accessibilityLabel += ` ${learningBonusLabel}: ${learningBonusXP} XP.`;
	}

	/**
	 * Give the answer icon its background color.
	 * Use the word's language level to choose the color behind its level label.
	 */
	const iconStyle = { backgroundColor: iconBackground };
	const cefrStyle = { backgroundColor: colors.light.CEFR[word.CEFR] };

	/**
	 * Render the thing
	 */
	return (
		<Animated.View
			entering={entering}
			accessible
			accessibilityLabel={accessibilityLabel}
			style={styles.row}
		>
			<View style={[styles.icon, iconStyle]}>
				<MaterialSymbol
					name={symbolName}
					size={18}
					color={iconColor}
				/>
			</View>
			<View style={styles.word}>
				<Text style={styles.french}>{word.frenchWord}</Text>
				<Text style={styles.translation}>{translation}</Text>
				{learningChange && (
					<View style={styles.learningChange}>
						<View style={styles.learningLevel}>
							<WordProgressIcon
								progress={learningChange.previous.key}
								size={14}
							/>
							<Text style={styles.learningChangeText}>{learningChange.previous.name}</Text>
						</View>
						<Text style={styles.learningChangeText}>→</Text>
						<View style={styles.learningLevel}>
							<WordProgressIcon
								progress={learningChange.next.key}
								size={14}
							/>
							<Text style={styles.learningChangeText}>{learningChange.next.name}</Text>
						</View>
					</View>
				)}
				{learningBonusXP > 0 && (
					<View style={styles.learningBonus}>
						<Text style={styles.learningBonusText}>{learningBonusLabel}</Text>
						<CountUp
							value={learningBonusXP}
							delay={countDelay}
							prefix="+"
							suffix=" XP"
							style={styles.learningBonusText}
						/>
					</View>
				)}
			</View>
			<View style={styles.metadata}>
				<CountUp
					value={result.xp}
					delay={countDelay}
					prefix={xpPrefix}
					suffix=" XP"
					style={[styles.xp, { color: xpColor }]}
				/>
				<Text style={[styles.cefr, cefrStyle]}>{word.CEFR}</Text>
			</View>
		</Animated.View>
	);
}

/**
 * List the words in the order they were reviewed.
 * Show each word's saved XP above its language level.
 */
export default function CompletionWordResults({
	words,
	results,
	color,
}: CompletionWordResultsProps) {
	/**
	 * Store each result under its word ID so we can find it for the right word.
	 */
	const resultsByWordId = new Map(results.map(result => [result.wordId, result]));

	/**
	 * Match each word with its result and keep them in order.
	 */
	const rows = words.flatMap(word => {
		const result = resultsByWordId.get(word.id);

		if (!result) {
			return [];
		}
		return [{ word, result }];
	});

	/**
	 * Redner it
	 */
	return (
		<View>
			{rows.map(({ word, result }, index) => (
				<WordResultRow
					key={word.id}
					word={word}
					result={result}
					color={color}
					index={index}
				/>
			))}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
	},
	icon: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	word: { flex: 1, minWidth: 0, gap: 2 },
	french: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		color: colors.dark.text,
	},
	translation: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 17,
		color: colors.dark.text,
	},
	metadata: { alignItems: 'flex-end', gap: 3 },
	xp: { fontFamily: 'lexend-600', fontSize: 13 },
	cefr: {
		fontFamily: 'azeret-mono-600',
		fontSize: 10,
		color: colors.dark.text,
		borderRadius: 3,
		paddingHorizontal: 4,
		paddingVertical: 2,
	},
	learningChange: {
		alignSelf: 'flex-start',
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 4,
		backgroundColor: `${colors.light.success}88`,
		borderRadius: 4,
		paddingHorizontal: 5,
		paddingVertical: 3,
		marginTop: 2,
	},
	learningLevel: { flexDirection: 'row', alignItems: 'center', gap: 3 },
	learningBonus: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 4,
		marginTop: 2,
	},
	learningBonusText: { fontFamily: 'lexend-600', fontSize: 10, color: colors.dark.success },
	learningChangeText: {
		flexShrink: 1,
		fontFamily: 'lexend-400',
		fontSize: 10,
		color: colors.dark.success,
	},
});
