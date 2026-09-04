import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * A deliberately small deck used to preview and test deck progression.
 */
export const DeckWaitingAtTheGate: CardDeck = {
	id: 'deck__waiting_at_the_gate',
	title: 'Waiting at the Gate',
	description: 'A short practice deck for the next leg of the journey.',
	chapter: 'Aéroport Oiseau',
	CEFR: ['A1'],
	unlockRequirements: [
		{
			id: 'deck__dawn_at_the_drop_off',
			requiredCompletionPercentage: 1,
		},
	],
	words: [],
	wordChoices: [],
	colors: {
		dark: {
			primary: '#263C45',
			secondary: '#527383',
		},
		light: {
			primary: '#E8F1F3',
			secondary: '#FFFFFF',
		},
	},
	passage: [
		{ text: 'Je', wordId: 'word_pronoun_je' },
		{ text: 'suis', wordId: 'word_auxiliary_suis' },
		{ text: 'à', wordId: 'word_preposition_a' },
		{ text: "l'aéroport", wordId: 'word_noun_l_aeroport', after: '. ' },
		{ text: "J'attends", wordId: 'word_verb_attendre' },
		{ text: 'mon', wordId: 'word_determiner_mon' },
		{ text: 'voyage', wordId: 'word_noun_voyage', after: '.' },
	],
	wordIds: [
		'word_pronoun_je',
		'word_auxiliary_suis',
		'word_preposition_a',
		'word_noun_l_aeroport',
		'word_verb_attendre',
		'word_determiner_mon',
		'word_noun_voyage',
	],
};
