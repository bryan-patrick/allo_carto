import { elisionTip } from '@/data/french/tips';
import colors from '@/src/app/colors';
import { buttonContentStyles } from '@/src/components/buttonContentStyles';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { FrenchTip } from '@/src/components/Tips/tipTypes';
import TTSButton from '@/src/components/TTSButton';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getEnglishTranslations } from '@/src/util/englishWordParts';
import formatFrenchWordWithArticle from '@/src/util/formatFrenchWordWithArticle';
import formatOtherWordForm from '@/src/util/formatOtherWordForm';
import type { GlossaryEntry } from '@/src/util/glossary';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Glossary row details and tip selection
 */
interface GlossaryWordRowProps {
	entry: GlossaryEntry;
	onSelectTip: (tip: FrenchTip) => void;
}

/**
 * Gives glossary tip buttons the same short labels as flashcards.
 */
function getGlossaryTipLabel(tip: FrenchTip): string {
	let label = 'Tip';

	if (tip.id === elisionTip.id) {
		label = 'Elision';
	}

	return label;
}

/**
 * Shows the other forms of a glossary word that the player has already seen.
 */
function showOtherGlossaryForms(entry: GlossaryEntry): void {
	const descriptions = entry.otherForms.map(word => {
		const relatedForm = {
			...word,
			isQuebecois: Boolean(word.isQuebecois),
		};

		return formatOtherWordForm(relatedForm, entry.word);
	});
	const message = descriptions.join('\n');

	Alert.alert(`Other forms of ${entry.word.frenchWord}`, message);
}

/**
 * Shows a seen word's meanings, pronunciation, and detail buttons.
 */
export default function GlossaryWordRow({ entry, onSelectTip }: GlossaryWordRowProps) {
	/**
	 * Pronunciation preference
	 */
	const { settings } = useAppSettings();

	/**
	 * Word details
	 */
	const { word, otherForms, tips } = entry;
	const frenchWord = formatFrenchWordWithArticle({
		article: word.frenchArticle,
		word: word.frenchWord,
	});
	const englishDefinitions = getEnglishTranslations(word);
	const translation = englishDefinitions.join(', ');
	const wordDetails = [word.partOfSpeech, word.form, word.tense].filter(Boolean).join(' | ');
	const hasDetailButtons = otherForms.length > 0 || tips.length > 0;

	/**
	 * Initial pronunciation
	 */
	let displayedPronunciation = `(${word.pronunciation})`;
	let pronunciationStyle = styles.readablePronunciation;

	if (settings.pronunciationFormat === 'ipa') {
		displayedPronunciation = `[${word.ipaPronunciation}]`;
		pronunciationStyle = styles.ipaPronunciation;
	}

	return (
		<View style={styles.wordRow}>
			<View style={styles.heading}>
				<Text style={styles.frenchWord}>
					{frenchWord}
					<Text style={styles.readablePronunciation}>{' · '}</Text>
					<Text style={pronunciationStyle}>{displayedPronunciation}</Text>
				</Text>
				<TTSButton
					wordsToSay={frenchWord}
					iconSize={26}
					rate={1}
				/>
			</View>
			<Text style={styles.translation}>{translation}</Text>
			{Boolean(wordDetails) && <Text style={styles.metadata}>{wordDetails}</Text>}
			{hasDetailButtons && (
				<View style={styles.actions}>
					{otherForms.length > 0 && (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={`Other seen forms of ${word.frenchWord}`}
							onPress={() => showOtherGlossaryForms(entry)}
							style={({ pressed }) => [
								styles.miniButton,
								pressed && buttonContentStyles.pressedMiniButton,
							]}
						>
							<MaterialSymbol
								name="language"
								size={15}
								color={colors.dark.primary}
								style={styles.buttonIcon}
							/>
							<Text style={styles.buttonLabel}>Other forms</Text>
						</Pressable>
					)}
					{tips.map(tip => (
						<Pressable
							key={tip.id}
							accessibilityRole="button"
							accessibilityLabel={`Read ${tip.title} for ${word.frenchWord}`}
							onPress={() => onSelectTip(tip)}
							style={({ pressed }) => [
								styles.miniButton,
								pressed && buttonContentStyles.pressedMiniButton,
							]}
						>
							<MaterialSymbol
								name="lightbulb_2"
								size={15}
								color={colors.dark.primary}
								style={styles.buttonIcon}
							/>
							<Text style={styles.buttonLabel}>{getGlossaryTipLabel(tip)}</Text>
						</Pressable>
					))}
				</View>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	wordRow: {
		paddingVertical: 10,
		gap: 4,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.border,
	},
	heading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	frenchWord: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 17,
		lineHeight: 21,
		color: colors.dark.text,
	},
	translation: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: 17,
		color: colors.dark.text,
	},
	metadata: {
		maxWidth: '100%',
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: 17,
		color: colors.dark.text,
		textAlign: 'left',
	},
	readablePronunciation: {
		fontFamily: 'lexend-400',
	},
	ipaPronunciation: {
		fontFamily: 'ipa-400',
	},
	actions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		gap: 6,
		paddingTop: 6,
	},
	miniButton: {
		...buttonContentStyles.miniButton,
		maxWidth: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		borderColor: colors.light.border,
	},
	buttonIcon: {
		width: 15,
		height: 17,
		lineHeight: 17,
		includeFontPadding: false,
	},
	buttonLabel: {
		...buttonContentStyles.label,
		fontSize: 15,
		lineHeight: 17,
		flexShrink: 1,
		color: colors.dark.primary,
	},
});
