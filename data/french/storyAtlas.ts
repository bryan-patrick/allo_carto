import {
	DeckACabAndACloseCall,
	DeckAnAmberApproach,
	DeckDawnAtTheDropOff,
} from '@/data/french/decks';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';

/**
 * Image paths
 */

const aeroportOiseau = require('@/src/app/assets/images/chapters/aeroport-oiseau.png');
const aVeryFrenchTravelDay = require('@/src/app/assets/images/stories/a-very-french-travel-day.png');

/**
 * Typing
 */
export type StoryCategory = 'History' | 'Mystery' | 'Travel';

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
			description: 'Flights, feathers, occasional bread delays. These decks focus on travelling.',
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
					decks: [DeckDawnAtTheDropOff, DeckAnAmberApproach, DeckACabAndACloseCall],
				},
			],
		},
		{
			id: 'stories-on-the-plains',
			name: 'Stories on the Plains',
			description:
				'Born from walking les plaines d’Abraham, these decks follow the plaques and monuments that reveal Québec’s past.',
			category: 'History',
			color: '#715e20',
			materialSymbolName: 'history_edu',
			chapters: [],
		},
	],
};

/**
 * Get every playable deck in progression order.
 */
export function getDecks(atlas: StoryAtlas = storyAtlas): CardDeck[] {
	return atlas.stories.flatMap(story => story.chapters.flatMap(chapter => chapter.decks));
}
