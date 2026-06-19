import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/*
 * TODO: curate actual words for this deck
 */
const toTheGate = require('@/src/app/assets/images/decks/to-the-gate.jpg');

export const DeckToTheGate: CardDeck = {
	title: 'To the Gate!',
	description:
		'Plane terms, getting on the flight down the walkway, gate announcements, finding seats, people watching etc.',
	CEFR: ['A1', 'A2'],
	words: [],
	image: toTheGate,
	wordChoices: [],
	colors: {
		dark: '#31223A',
		light: '#583C68',
	},
	wordIds: [
		'word_verb_entrer',
		'word_verb_prendre',
		'word_verb_demander',
		'word_adverb_ici',
		'word_adjective_grand',
		'word_preposition_a',
	],
};
