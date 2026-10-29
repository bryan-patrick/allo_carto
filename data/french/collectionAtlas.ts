import type { WordProgressKey } from '@/src/util/wordProgress';
import type { ImageSourcePropType } from 'react-native';

/**
 * Typing
 */
export type CollectionRewardLevel = Exclude<WordProgressKey, 'unseen'>;

export interface CollectionRewardDefinition {
	requiredWordProgress: CollectionRewardLevel;
	xp: number;
}

export interface CollectionWordDefinition {
	wordId: string;
	image?: ImageSourcePropType;
}

export interface VocabularyCollection {
	id: string;
	name: string;
	description: string;
	words: CollectionWordDefinition[];
	rewards: CollectionRewardDefinition[];
}

export interface CollectionAtlas {
	collections: VocabularyCollection[];
}

export const placeholderStampImage: ImageSourcePropType = require('@/src/app/assets/images/chapters/how-it-works.png');

/**
 * Sets the XP awarded for reaching each collection learning level.
 */
const collectionLevelRewards: CollectionRewardDefinition[] = [
	{
		requiredWordProgress: 'new',
		xp: 50,
	},
	{
		requiredWordProgress: 'learning',
		xp: 100,
	},
	{
		requiredWordProgress: 'familiar',
		xp: 150,
	},
	{
		requiredWordProgress: 'known',
		xp: 200,
	},
	{
		requiredWordProgress: 'mastered',
		xp: 250,
	},
];

/**
 * Defines each stamp album's words, artwork, and rewards using existing vocabulary IDs.
 */
export const collectionAtlas: CollectionAtlas = {
	collections: [
		{
			id: 'days-of-the-week',
			name: 'Days of the Week',
			description: 'Collect all seven days, from lundi through dimanche.',
			words: [
				{
					wordId: 'word_noun_lundi',
					image: placeholderStampImage,
				},
				{
					wordId: 'word_noun_mardi',
				},
				{
					wordId: 'word_noun_mercredi',
				},
				{
					wordId: 'word_noun_jeudi',
				},
				{
					wordId: 'word_noun_vendredi',
				},
				{
					wordId: 'word_noun_samedi',
				},
				{
					wordId: 'word_noun_dimanche',
				},
			],
			rewards: collectionLevelRewards,
		},
		{
			id: 'clothing',
			name: 'Clothing',
			description: 'Everyday clothes, from souliers to a warm tuque.',
			words: [
				{
					wordId: 'word_noun_souliers',
					image: require('@/src/app/assets/images/chapters/getting-ready.png'),
				},
				{
					wordId: 'word_noun_veste',
				},
				{
					wordId: 'word_noun_pantalon',
				},
				{
					wordId: 'word_noun_jean',
				},
				{
					wordId: 'word_noun_gants',
				},
				{
					wordId: 'word_noun_chapeau',
				},
				{
					wordId: 'word_noun_blouse',
				},
				{
					wordId: 'word_noun_chemise',
				},
				{
					wordId: 'word_noun_tuque',
				},
			],
			rewards: collectionLevelRewards,
		},
		{
			id: 'seasons',
			name: 'Seasons',
			description: 'Discover printemps, été, automne, and hiver.',
			words: [
				{
					wordId: 'word_noun_printemps',
					image: require('@/src/app/assets/images/chapters/leaves-in-the-yard.png'),
				},
				{
					wordId: 'word_noun_l_ete',
				},
				{
					wordId: 'word_noun_automne',
				},
				{
					wordId: 'word_noun_hiver',
				},
			],
			rewards: collectionLevelRewards,
		},
		{
			id: 'leos-kitchen',
			name: 'Léo’s Kitchen',
			description: 'A croissant, a toaster, and a little cheese from Le chef Léo.',
			words: [
				{
					wordId: 'word_noun_croissant',
					image: placeholderStampImage,
				},
				{
					wordId: 'word_noun_grille_pain',
				},
				{
					wordId: 'word_noun_fromage',
				},
			],
			rewards: collectionLevelRewards,
		},
	],
};
