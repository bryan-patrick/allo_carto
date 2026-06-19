import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/*
 * TODO: curate actual words for this deck
 */
const dawnDropOff = require('@/src/app/assets/images/decks/dawn-drop-off.jpg');

export const DeckDawnAtTheDropOff: CardDeck = {
	title: 'Dawn at the Drop Off',
	description:
		'Luggage, preparation, getting a ride, at the entrance, directions to the drop off, etc.',
	CEFR: ['A1', 'B1'],
	words: [],
	image: dawnDropOff,
	wordChoices: [],
	wordIds: [
		'word_verb_prendre',
		'word_verb_demander',
		'word_verb_voir',
		'word_adverb_ici',
		'word_adjective_grand',
		'word_preposition_a',
	],
};
