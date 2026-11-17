import type { Word, WordForm } from '@/src/components/CardDeck/cardDeckTypes';
import type { OtherWordForm } from '@/src/db/queries/getOtherWordForms';
import formatFrenchWordWithArticle from './formatFrenchWordWithArticle';

/**
 * Display labels
 */
const formDescriptions: Record<WordForm, string> = {
	contraction: 'contracted form',
	elision: 'elided form',
	feminine: 'feminine form',
	imperfect: 'imperfect tense conjugation',
	infinitive: 'infinitive, or base verb form',
	masculine: 'masculine form',
	'past participle': 'past participle',
	'past historic': 'past historic tense conjugation',
	plural: 'plural form',
	possessive: 'possessive form',
	'present participle': 'present participle',
	present: 'present tense conjugation',
};

/**
 * Explains how a related form differs from the current flashcard's word.
 */
function getFormDescription(candidate: OtherWordForm, currentWord: Word): string {
	let description = 'related form';

	if (candidate.form) {
		description = formDescriptions[candidate.form];
	} else if (candidate.gender) {
		description = `${candidate.gender.toLowerCase()} form`;
	}

	if (candidate.form === 'plural' && candidate.gender) {
		description = `${candidate.gender.toLowerCase()} plural form`;
	}

	if (candidate.isQuebecois) {
		description = 'Québécois variant';
	} else if (currentWord.isQuebecois) {
		description = 'standard French variant';
	}

	if (currentWord.form === 'elision' && candidate.form !== 'elision') {
		description = 'full form';
	}

	return description;
}

/**
 * Shows a related French word and its type of form.
 */
export default function formatOtherWordForm(candidate: OtherWordForm, currentWord: Word): string {
	/**
	 * French word and form description
	 */
	const word = formatFrenchWordWithArticle({
		article: candidate.frenchArticle,
		word: candidate.frenchWord,
	});
	const formDescription = getFormDescription(candidate, currentWord);

	return `${word} (${formDescription})`;
}
