import {
	DeckAForkInstead,
	DeckATableForOne,
	DeckAutumnInTheNeighborhood,
	DeckCardsAndXp,
	DeckChoosingDinner,
	DeckGettingReady,
	DeckHaveFun,
	DeckKnowTheWord,
	DeckRainyNight,
	DeckStoriesAndFlashcards,
	DeckStoriesChaptersAndDecks,
	DeckStudyAndReadAgain,
	DeckTheWalkToTheRestaurant,
	DeckUntilNextTime,
	DeckWelcomeToAlloCarto,
	DeckWindowWatcher,
	DeckWordCollections,
} from '@/data/french/decks';
import type colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';
import { storyAreas, type StoryArea } from './storyAreas';

/**
 * Image paths
 */
const leoInTheWindow = require('@/src/app/assets/images/chapters/leo-in-the-window.png');
const leavesInTheYard = require('@/src/app/assets/images/chapters/leaves-in-the-yard.png');
const gettingReady = require('@/src/app/assets/images/chapters/getting-ready.png');
const aTableForOne = require('@/src/app/assets/images/chapters/a-table-for-one.png');
const whatIsAlloCarto = require('@/src/app/assets/images/chapters/what-is-allo-carto.png');
const howItWorks = require('@/src/app/assets/images/chapters/how-it-works.png');
const additionalInformation = require('@/src/app/assets/images/chapters/additional-information.png');
export const chapterSelectBackground = require('@/src/app/assets/images/chapters/chapters-bg.jpg');

/**
 * Typing
 */
export type StoryCategory = keyof typeof colors.category;

export interface StoryAtlas {
	areas: StoryArea[];
	stories: DeckStory[];
}

export interface DeckStory extends Progression {
	id: string;
	requiredLevel: number;
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
	areas: storyAreas,
	stories: [
		{
			id: 'welcome-to-allo-carto',
			requiredLevel: 1,
			name: 'Welcome to Allô Carto',
			description:
				'Learn how to read stories, study decks, and grow your vocabulary in Allô Carto.',
			category: 'Beginner',
			image: chapterSelectBackground,
			materialSymbolName: 'waving_hand',
			chapters: [
				{
					id: 'welcome-to-allo-carto-chapter-1',
					label: 'Chapter 1',
					name: 'What is Allô Carto?',
					image: whatIsAlloCarto,
					decks: [DeckWelcomeToAlloCarto, DeckStoriesAndFlashcards],
				},
				{
					id: 'welcome-to-allo-carto-chapter-2',
					label: 'Chapter 2',
					name: 'How it works',
					image: howItWorks,
					unlockRequirements: [
						{ id: 'welcome-to-allo-carto-chapter-1', requiredCompletionPercentage: 20 },
					],
					decks: [DeckStoriesChaptersAndDecks, DeckStudyAndReadAgain, DeckCardsAndXp],
				},
				{
					id: 'welcome-to-allo-carto-chapter-3',
					label: 'Chapter 3',
					name: 'Additional information',
					image: additionalInformation,
					unlockRequirements: [
						{ id: 'welcome-to-allo-carto-chapter-2', requiredCompletionPercentage: 20 },
					],
					decks: [DeckKnowTheWord, DeckWordCollections, DeckHaveFun],
				},
			],
		},
		{
			id: 'a-new-restaurant',
			requiredLevel: 10,
			name: 'A New Restaurant',
			description: 'Wallace heads out to try a small restaurant recommended by Mathieu.',
			category: 'Dining',
			image: chapterSelectBackground,
			materialSymbolName: 'restaurant',
			chapters: [
				{
					id: 'a-new-restaurant-chapter-1',
					label: 'Chapter 1',
					name: 'Getting Ready',
					image: gettingReady,
					decks: [DeckGettingReady, DeckTheWalkToTheRestaurant],
				},
				{
					id: 'a-table-for-one',
					label: 'Chapter 2',
					name: 'A Table for One',
					image: aTableForOne,
					unlockRequirements: [
						{ id: 'a-new-restaurant-chapter-1', requiredCompletionPercentage: 20 },
					],
					decks: [DeckATableForOne, DeckChoosingDinner, DeckAForkInstead, DeckUntilNextTime],
				},
			],
		},
		{
			id: 'meeting-leo',
			requiredLevel: 10,
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
			requiredLevel: 10,
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
			requiredLevel: 10,
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
