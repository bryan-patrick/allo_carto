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
	image: ImageSourcePropType;
	words: CollectionWordDefinition[];
	rewards: CollectionRewardDefinition[];
}

export interface CollectionAtlas {
	collections: VocabularyCollection[];
}

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
			id: 'leos-kitchen',
			name: 'Léo’s Kitchen',
			description: 'A croissant, a toaster, and a little cheese from Le chef Léo.',
			image: require('@/src/app/assets/images/chapters/how-it-works.png'),
			words: [
				{
					wordId: 'word_noun_croissant',
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
