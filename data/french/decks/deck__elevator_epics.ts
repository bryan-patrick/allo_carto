import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

/*
 * TODO: curate actual words for this deck
 */
const elevatorEpics = require('@/src/app/assets/images/decks/elevator-epics.jpg');

export const DeckElevatorEpics: CardDeck = {
	title: 'Elevator Epics',
	description: 'Epic stories from random people in elevators.',
	CEFR: ['A1', 'A2'],
	words: [],
	image: elevatorEpics,
	wordChoices: [],
	wordIds: [],
};
