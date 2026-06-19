import {
	DeckDawnAtTheDropOff,
	DeckElevatorEpics,
	DeckLostRoomKeys,
	DeckToTheGate,
	DeckTroubleInTheTerminal,
} from '@/data/french/decks';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { ImageSourcePropType } from 'react-native';

const aeroportOiseau = require('@/src/app/assets/images/places/aeroport-oiseau.jpg');
const hotelChance = require('@/src/app/assets/images/places/hotel-chance.jpg');

/**
 * Typing
 */
export interface DeckAtlas {
	chapters: DeckChapter[];
}

export interface DeckChapter {
	id: string;
	name: string;
	places: DeckPlace[];
}

export interface DeckPlace {
	id: string;
	name: string;
	description: string;
	decks: CardDeck[];
	image?: ImageSourcePropType;
}

/**
 * The idea is:
 * Chapter -> Place -> Situation (deck)
 */
export const deckAtlas: DeckAtlas = {
	chapters: [
		{
			id: 'a-very-french-travel-day',
			name: 'A Very French Travel Day',
			places: [
				{
					id: 'aeroport-oiseau',
					name: 'Aéroport Oiseau',
					description:
						'Flights, feathers, occasional bread delays. These decks focus on situations while travelling.',
					image: aeroportOiseau,
					decks: [
						DeckDawnAtTheDropOff,
						DeckTroubleInTheTerminal,
						DeckToTheGate,
					],
				},
				{
					id: 'hotel-bonne-chance',
					name: 'Hôtel Bonne Chance',
					description: 'Clean sheets. Questionable luck.',
					image: hotelChance,
					decks: [DeckLostRoomKeys, DeckElevatorEpics],
				},
			],
		},
	],
};
