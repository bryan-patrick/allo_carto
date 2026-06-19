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
	CEFR: ['B1', 'B2'],
	words: [],
	image: troubleInTerminal,
	wordChoices: [],
	wordIds: [
		'word_verb_entrer',
		'word_verb_demander',
		'word_verb_voir',
		'word_adverb_ici',
		'word_adjective_petit',
		'word_preposition_a',
	],
};
