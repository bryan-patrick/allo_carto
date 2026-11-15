import type { WordProgressKey } from '@/src/util/wordProgress';
import type { ImageSourcePropType } from 'react-native';
import { leosKitchenCollection } from './collections/leos-kitchen';

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
 * List active albums, including Léo’s Kitchen with bread from Leo and Poe.
 */
export const collectionAtlas: CollectionAtlas = {
	collections: [leosKitchenCollection],
};
