import {
	DeckDawnAtTheDropOff,
	DeckElevatorEpics,
	DeckLostRoomKeys,
	DeckStreetMarketTreasureHunt,
	DeckToTheGate,
	DeckTroubleInTheTerminal,
} from '@/data/french/decks';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';

/**
 * Image paths
 */
const aeroportOiseau = require('@/src/app/assets/images/places/aeroport-oiseau.jpg');
const hotelChance = require('@/src/app/assets/images/places/hotel-chance.jpg');
const rueSaintMatou = require('@/src/app/assets/images/places/rue-saint-matou.jpg');
const aVeryFrenchTravelDay = require('@/src/app/assets/images/chapters/a-very-french-travel-day.png');
const lostAndSecretDecks = require('@/src/app/assets/images/chapters/lost-and-secret-decks.png');

/**
 * Typing
 */
export interface DeckAtlas {
	chapters: DeckChapter[];
}

export interface DeckChapter extends Progression {
	id: string;
	name: string;
	places: DeckPlace[];
	chapterName: string;
	image?: ImageSourcePropType;
	color?: string;
	materialIconName?: string;
}

export interface DeckPlace extends Progression {
	id: string;
	name: string;
	description: string;
	decks: CardDeck[];
	image?: ImageSourcePropType;
}

/**
 * The idea is:
 * Chapter -> Place -> Story (deck)
 */
export const deckAtlas: DeckAtlas = {
	chapters: [
		{
			id: 'a-very-french-travel-day',
			name: 'A Very French Travel Day',
			chapterName: 'Chapter 1:',
			image: aVeryFrenchTravelDay,
			color: '#253749',
			materialIconName: 'flight',
			places: [
				{
					id: 'aeroport-oiseau',
					name: 'Aéroport Oiseau',
					description:
						'Flights, feathers, occasional bread delays. These decks focus on situations while travelling.',
					image: aeroportOiseau,
					decks: [DeckDawnAtTheDropOff, DeckTroubleInTheTerminal, DeckToTheGate],
				},
				{
					id: 'hotel-bonne-chance',
					unlockRequirements: [
						{
							id: 'aeroport-oiseau',
							requiredCompletionPercentage: 50,
						},
					],
					name: 'Hôtel Bonne Chance',
					description: 'Clean sheets. Questionable luck.',
					image: hotelChance,
					decks: [DeckLostRoomKeys, DeckElevatorEpics],
				},
			],
		},
		{
			id: 'lost-and-secret-decks',
			unlockRequirements: [
				{
					id: 'a-very-french-travel-day',
					requiredCompletionPercentage: 50,
				},
			],
			name: 'Lost and Secret Decks',
			chapterName: 'Epilogue:',
			image: lostAndSecretDecks,
			color: '#473022',
			materialIconName: 'pets',
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
 */
export function getDecks(atlas: DeckAtlas = deckAtlas): CardDeck[] {
	return atlas.chapters.flatMap(chapter => chapter.places.flatMap(place => place.decks));
}
