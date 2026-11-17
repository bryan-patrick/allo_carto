import type { WordProgressKey } from '@/src/util/wordProgress';
import type { ImageSourcePropType } from 'react-native';
import { ourFavoritePlacesCollection } from './collections/our-favorite-places';

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
 * Stamp albums.
 */
export const collectionAtlas: CollectionAtlas = {
	collections: [ourFavoritePlacesCollection],
};
