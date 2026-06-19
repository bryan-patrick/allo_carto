import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/*
 * TODO: curate actual words for this deck
 */
const elevatorEpics = require('@/src/app/assets/images/decks/elevator-epics.jpg');

export const DeckElevatorEpics: CardDeck = {
	title: 'Elevator Epics',
	description: 'Epic stories from random people in elevators.',
	CEFR: ['A1', 'A2'],
	image: elevatorEpics,
	words: [],
	wordChoices: [],
	wordIds: [
		'word_verb_entrer',
		'word_verb_ouvrir',
		'word_verb_fermer',
		'word_interjection_bonjour',
		'word_interjection_pardon',
		'word_adverb_ici',
	],
};
