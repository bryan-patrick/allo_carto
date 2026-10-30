import {
	DeckABeautifulCroissant,
	DeckACardInTheToaster,
	DeckAForkInstead,
	DeckATableForOne,
	DeckAnotherCard,
	DeckAutumnInTheNeighborhood,
	DeckCardsAndXp,
	DeckChoosingDinner,
	DeckGettingReady,
	DeckHaveFun,
	DeckItsPaper,
	DeckKnowTheWord,
	DeckLeoIsHungry,
	DeckLeoTakesTheCard,
	DeckRainyNight,
	DeckStoriesAndFlashcards,
	DeckStoriesChaptersAndDecks,
	DeckStudyAndReadAgain,
	DeckTheCardAndTheToaster,
	DeckTheCardTurnsBlack,
	DeckTheWalkToTheRestaurant,
	DeckUntilNextTime,
	DeckWallaceUnplugsTheToaster,
	DeckWelcomeToAlloCarto,
	DeckWindowWatcher,
	DeckWordCollections,
} from '@/data/french/decks';
import type colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { ImageSourcePropType } from 'react-native';
import { storyAreas, type StoryArea } from './storyAreas';

/*
 * Image paths
 */
const leoInTheWindow = require('@/src/app/assets/images/chapters/leo-in-the-window.png');
const leavesInTheYard = require('@/src/app/assets/images/chapters/leaves-in-the-yard.png');
const gettingReady = require('@/src/app/assets/images/chapters/getting-ready.png');
const aTableForOne = require('@/src/app/assets/images/chapters/a-table-for-one.png');
const whatIsAlloCarto = require('@/src/app/assets/images/chapters/what-is-allo-carto.png');
const howItWorks = require('@/src/app/assets/images/chapters/how-it-works.png');
const additionalInformation = require('@/src/app/assets/images/chapters/additional-information.png');
const welcomeChapterOne = require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH01.png');
const welcomeChapterTwo = require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH02.png');
const welcomeChapterThree = require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH03.png');
const welcomeStoryBackground = require('@/src/app/assets/images/story_backgrounds/S01.jpg');
export const chapterSelectBackground = require('@/src/app/assets/images/chapters/chapters-bg.jpg');

/*
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
	description?: string;
	decks: CardDeck[];
	image?: ImageSourcePropType;
	characterImage?: ImageSourcePropType;
}

/*
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
			description: 'Learn how to read stories, study their words, and grow your vocabulary.',
			category: 'Beginner',
			image: welcomeStoryBackground,
			materialSymbolName: 'waving_hand',
			chapters: [
				{
					id: 'welcome-to-allo-carto-chapter-1',
					requiredLevel: 1,
					label: 'Chapter 1',
					name: 'What is Allô Carto?',
					description: 'Discover how stories and flashcards help you learn French with Allô Carto.',
					characterImage: welcomeChapterOne,
					decks: [DeckWelcomeToAlloCarto, DeckStoriesAndFlashcards],
				},
				{
					id: 'welcome-to-allo-carto-chapter-2',
					requiredLevel: 4,
					label: 'Chapter 2',
					name: 'How it works',
					description:
						'Explore chapters and paragraphs, study their words, and earn XP as you learn.',
					characterImage: welcomeChapterTwo,
					unlockRequirements: [{ id: 'deck__stories_and_flashcards', requiredWordProgress: 'new' }],
					decks: [DeckStoriesChaptersAndDecks, DeckStudyAndReadAgain, DeckCardsAndXp],
				},
				{
					id: 'welcome-to-allo-carto-chapter-3',
					requiredLevel: 7,
					label: 'Chapter 3',
					name: 'Additional information',
					description:
						'Track your vocabulary, discover collections, and keep learning through stories.',
					characterImage: welcomeChapterThree,
					unlockRequirements: [{ id: 'deck__cards_and_xp', requiredWordProgress: 'new' }],
					decks: [DeckKnowTheWord, DeckWordCollections, DeckHaveFun],
				},
			],
		},
		{
			id: 'le-chef-leo',
			requiredLevel: 3,
			name: 'Le chef Léo',
			description: 'A cat, flashcards, and a toaster',
			category: 'Leo the Cat',
			image: chapterSelectBackground,
			materialSymbolName: 'bakery_dining',
			chapters: [
				{
					id: 'le-chef-leo-chapter-1',
					label: 'Chapter 1',
					name: 'A Good Croissant',
					image: howItWorks,
					characterImage: whatIsAlloCarto,
					description:
						'Hungry Léo spots a croissant on a card and turns his attention to the toaster.',
					decks: [DeckLeoIsHungry, DeckABeautifulCroissant, DeckTheCardAndTheToaster],
				},
				{
					id: 'le-chef-leo-chapter-2',
					label: 'Chapter 2',
					name: 'The Kitchen',
					image: howItWorks,
					characterImage: additionalInformation,
					description: 'While Wallace reads, Léo takes the card and puts it in the toaster.',
					unlockRequirements: [
						{ id: 'deck__the_card_and_the_toaster', requiredWordProgress: 'new' },
					],
					decks: [DeckLeoTakesTheCard, DeckACardInTheToaster, DeckTheCardTurnsBlack],
				},
				{
					id: 'le-chef-leo-chapter-3',
					label: 'Chapter 3',
					name: 'Oh No!',
					image: additionalInformation,
					characterImage: whatIsAlloCarto,
					description:
						'Wallace unplugs the smoking toaster, but Léo has already found another card.',
					unlockRequirements: [{ id: 'deck__the_card_turns_black', requiredWordProgress: 'new' }],
					decks: [DeckWallaceUnplugsTheToaster, DeckItsPaper, DeckAnotherCard],
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
					description:
						'Wallace gets ready for dinner and walks through the autumn streets to a new restaurant.',
					image: gettingReady,
					decks: [DeckGettingReady, DeckTheWalkToTheRestaurant],
				},
				{
					id: 'a-table-for-one',
					label: 'Chapter 2',
					name: 'A Table for One',
					description:
						'Wallace settles in for noodles and dumplings, with a few small mishaps along the way.',
					image: aTableForOne,
					unlockRequirements: [
						{ id: 'deck__the_walk_to_the_restaurant', requiredWordProgress: 'new' },
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
			category: 'Leo the Cat',
			image: chapterSelectBackground,
			materialSymbolName: 'pets',
			chapters: [
				{
					id: 'leo-in-the-window',
					label: 'Chapter 1',
					name: 'Leo in the Window',
					description: 'On a rainy night, a pair of yellow eyes appears at Wallace’s window.',
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
					description: 'Autumn leaves fill the neighborhood as Leo watches from a maple tree.',
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
				'Born from walking les plaines d’Abraham, these paragraphs follow the plaques and monuments that reveal Québec’s past.',
			category: 'History',
			image: chapterSelectBackground,
			materialSymbolName: 'history_edu',
			chapters: [],
		},
	],
};

/*
 * Get every playable deck in progression order.
 */
export function getDecks(atlas: StoryAtlas = storyAtlas): CardDeck[] {
	return atlas.stories.flatMap(story => story.chapters.flatMap(chapter => chapter.decks));
}
