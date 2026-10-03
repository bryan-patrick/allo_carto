import {
	DeckAutumnInTheNeighborhood,
	DeckRainyNight,
	DeckWindowWatcher,
} from '@/data/french/decks';
import type colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';

/**
 * Image paths
 */
const leoInTheWindow = require('@/src/app/assets/images/chapters/leo-in-the-window.png');
const leavesInTheYard = require('@/src/app/assets/images/chapters/leaves-in-the-yard.png');
export const chapterSelectBackground = require('@/src/app/assets/images/chapters/chapters-bg.jpg');

/**
 * Typing
 */
export type StoryCategory = keyof typeof colors.category;

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
			id: 'meeting-leo',
			name: 'Meeting Leo',
			description:
				'Wallace hopes that the strange eyes outside his window belong to a very large cat.',
			category: 'Cat Files',
			image: chapterSelectBackground,
			materialSymbolName: 'pets',
			chapters: [
				{
					id: 'leo-in-the-window',
					label: 'Chapter 1',
					name: 'Leo in the Window',
					image: leoInTheWindow,
					decks: [DeckRainyNight, DeckWindowWatcher],
				},
			],
		},
		{
			id: 'a-matter-of-leaves',
			name: 'A Matter of Leaves',
			description: 'Leo the cat watches two humans feud over a pile of leaves.',
			category: 'Social',
			image: chapterSelectBackground,
			materialSymbolName: 'eco',
			chapters: [
				{
					id: 'leaves-all-over',
					label: 'Chapter 1',
					name: 'Leaves All Over',
					image: leavesInTheYard,
					decks: [DeckAutumnInTheNeighborhood],
				},
				{
					id: 'the-other-side',
					label: 'Chapter 2',
					name: 'The Other Side',
					decks: [],
				},
				{
					id: 'it-was-the-wind',
					label: 'Chapter 3',
					name: 'It Was the Wind',
					decks: [],
				},
			],
		},
		{
			id: 'walking-the-plains',
			name: 'Walking the Plains',
			description:
				'Born from walking les plaines d’Abraham, these decks follow the plaques and monuments that reveal Québec’s past.',
			category: 'History',
			image: chapterSelectBackground,
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
