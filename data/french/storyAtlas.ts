import { DeckDawnAtTheDropOff, DeckWaitingAtTheGate } from '@/data/french/decks';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';

/**
 * Image paths
 */

const aeroportOiseau = require('@/src/app/assets/images/chapters/aeroport-oiseau.png');
const hotelChance = require('@/src/app/assets/images/chapters/chateau-frontenac.png');
const rueSaintMatou = require('@/src/app/assets/images/chapters/rue-saint-matou.jpg');
const aVeryFrenchTravelDay = require('@/src/app/assets/images/stories/a-very-french-travel-day.png');
const lostAndSecretDecks = require('@/src/app/assets/images/stories/lost-and-secret-decks.png');

/**
 * Typing
 */
export type StoryCategory = 'Mystery' | 'Travel';

export interface StoryAtlas {
	stories: DeckStory[];
}

export interface DeckStory extends Progression {
	id: string;
	name: string;
	description: string;
	category: StoryCategory;
	chapters: DeckChapter[];
	image?: ImageSourcePropType;
	color?: string;
	materialSymbolName?: string;
}

export interface DeckChapter extends Progression {
	id: string;
	label: string;
	name: string;
	decks: CardDeck[];
	image?: ImageSourcePropType;
}

/**
 * The idea is:
 * Story -> Chapter -> Deck
 */
export const storyAtlas: StoryAtlas = {
	stories: [
		{
			id: 'a-very-french-travel-day',
			name: 'A Very French Travel Day',
			description:
				'Flights, feathers, occasional bread delays. These decks focus on situations while travelling.',
			category: 'Travel',
			image: aVeryFrenchTravelDay,
			color: '#454A36',
			materialSymbolName: 'flight',
			chapters: [
				{
					id: 'aeroport-oiseau',
					label: 'Chapter 1',
					name: 'Aéroport Oiseau',
					image: aeroportOiseau,
					decks: [DeckDawnAtTheDropOff, DeckWaitingAtTheGate],
				},
				{
					id: 'hotel-bonne-chance',
					label: 'Chapter 2',
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
			category: 'Mystery',
			image: lostAndSecretDecks,
			color: '#473022',
			materialSymbolName: 'key',
			chapters: [
				{
					id: 'rue-saint-matou',
					label: 'Chapter 1',
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
export function getDecks(atlas: StoryAtlas = storyAtlas): CardDeck[] {
	return atlas.stories.flatMap(story => story.chapters.flatMap(chapter => chapter.decks));
}
