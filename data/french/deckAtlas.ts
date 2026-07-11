import {
	DeckDawnAtTheDropOff,
	DeckElevatorEpics,
	DeckLostRoomKeys,
	DeckStreetMarketTreasureHunt,
	DeckToTheGate,
	DeckTroubleInTheTerminal,
} from '@/data/french/decks';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { ImageSourcePropType } from 'react-native';

const aeroportOiseau = require('@/src/app/assets/images/places/aeroport-oiseau.jpg');
const hotelChance = require('@/src/app/assets/images/places/hotel-chance.jpg');
const rueSaintMatou = require('@/src/app/assets/images/places/rue-saint-matou.jpg');

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
	chapterName: string;
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
			chapterName: 'Chapter 1:',
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
		{
			id: 'lost-and-secret-decks',
			name: 'Lost and Secret Decks',
			chapterName: 'Epilogue:',
			places: [
				{
					id: 'rue-saint-matou',
					name: 'Rue Saint Matou',
					description: 'Bonsoir, hooman. Bienvenue.',
					image: rueSaintMatou,
					decks: [DeckStreetMarketTreasureHunt],
				},
			],
		},
	],
};

/**
 * Get every playable deck in progression order.
 *
 * The atlas is the source of truth for progression: chapters contain places,
 * and places contain decks. Keeping the flattening here prevents lock logic
 * from having to know about that structure.
 */
export function getDecks(atlas: DeckAtlas = deckAtlas): CardDeck[] {
	return atlas.chapters.flatMap((chapter) =>
		chapter.places.flatMap((place) => place.decks),
	);
}
