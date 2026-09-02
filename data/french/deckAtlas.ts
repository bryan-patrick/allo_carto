import { DeckDawnAtTheDropOff } from '@/data/french/decks';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';

/**
 * Image paths
 */

const aeroportOiseau = require('@/src/app/assets/images/places/aeroport-oiseau.png');
const hotelChance = require('@/src/app/assets/images/places/chateau-frontenac.png');
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
	description: string;
	places: DeckPlace[];
	label: string;
	image?: ImageSourcePropType;
	color?: string;
	materialSymbolName?: string;
}

export interface DeckPlace extends Progression {
	id: string;
	name: string;
	decks: CardDeck[];
	image?: ImageSourcePropType;
}

/**
 * The idea is:
 * Chapter -> Place -> Deck
 */
export const deckAtlas: DeckAtlas = {
	chapters: [
		{
			id: 'a-very-french-travel-day',
			name: 'A Very French Travel Day',
			description:
				'Flights, feathers, occasional bread delays. These decks focus on situations while travelling.',
			label: 'Chapter 1',
			image: aVeryFrenchTravelDay,
			color: '#454A36',
			materialSymbolName: 'flight',
			places: [
				{
					id: 'aeroport-oiseau',
					name: 'Aéroport Oiseau',
					image: aeroportOiseau,
					decks: [DeckDawnAtTheDropOff],
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
					image: hotelChance,
					decks: [],
				},
			],
		},
		{
			id: 'lost-and-secret-decks',
			unlockRequirements: [
				{
					id: 'aeroport-oiseau',
					requiredCompletionPercentage: 1,
				},
				{
					id: 'hotel-bonne-chance',
					requiredCompletionPercentage: 50,
				},
			],
			name: 'Lost and Secret Decks',
			description: 'Bonsoir, hooman. Bienvenue.',
			label: 'Epilogue:',
			image: lostAndSecretDecks,
			color: '#473022',
			materialSymbolName: 'key',
			places: [
				{
					id: 'rue-saint-matou',
					name: 'Rue Saint Matou',
					image: rueSaintMatou,
					decks: [],
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
