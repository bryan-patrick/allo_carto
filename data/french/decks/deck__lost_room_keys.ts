import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/*
 * TODO: curate actual words for this deck
 */
const lostRoomKeys = require('@/src/app/assets/images/decks/lost-room-keys.jpg');

export const DeckLostRoomKeys: CardDeck = {
	title: 'Lost Room Keys',
	description:
		'Interaction with concierge, directions to the hotel, parking/valet, room upgrades, views, amenities, confusion about room mix ups',
	CEFR: ['B2', 'C1'],
	words: [],
	image: lostRoomKeys,
	wordChoices: [],
	colors: {
		dark: '#402E0F',
		light: '#634718',
	},
	wordIds: [
		'word_noun_cle',
		'word_verb_ouvrir',
		'word_verb_fermer',
		'word_verb_demander',
		'word_adverb_ici',
		'word_adjective_grand',
	],
};
