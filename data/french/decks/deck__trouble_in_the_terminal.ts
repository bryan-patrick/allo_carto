import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Image src
 */
/*
 * TODO: curate actual words for this deck
 */
const troubleInTerminal = require('@/src/app/assets/images/decks/trouble-in-terminal.jpg');

export const DeckTroubleInTheTerminal: CardDeck = {
	title: 'Trouble at the Terminal',
	description:
		'Information about the airport, late, early, times, crowds, people rushing, business, etc.',
	CEFR: ['A1', 'B2'],
	words: [],
	image: troubleInTerminal,
	wordChoices: [],
	colors: {
		dark: '#072725',
		light: '#065653',
	},
	wordIds: [
		'word_verb_entrer',
		'word_verb_demander',
		'word_verb_voir',
		'word_verb_senregistrer',
		'word_verb_decoller',
		'word_verb_atterrir',
		'word_verb_annuler',
		'word_verb_retarder',
		'word_verb_fouiller',
		'word_verb_balayer',
		'word_verb_recuperer',
		'word_adverb_ici',
		'word_adverb_actuellement',
		'word_adverb_provisoirement',
		'word_adverb_immediatement',
		'word_adverb_separement',
		'word_adverb_gratuitement',
		'word_adverb_approximativement',
		'word_adverb_precisement',
		'word_adverb_auparavant',
		'word_adjective_petit',
		'word_adjective_annule',
		'word_adjective_complet',
		'word_adjective_interdit',
		'word_adjective_valide',
		'word_adjective_expire',
		'word_adjective_prioritaire',
		'word_adjective_international',
		'word_adjective_suspect',
		'word_preposition_a',
		'word_preposition_durant',
		'word_preposition_malgre',
		'word_preposition_parmi',
		'word_preposition_outre',
		'word_preposition_via',
		'word_preposition_excepte',
		'word_preposition_hormis',
		'word_preposition_suivant',
		'word_noun_aerogare',
		'word_noun_borne',
		'word_noun_embarquement',
		'word_noun_carrousel',
		'word_noun_douanes',
		'word_noun_correspondance',
		'word_noun_annulation',
		'word_noun_escale',
	],
};
