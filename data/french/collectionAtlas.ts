import type { WordProgressKey } from '@/src/util/wordProgress';
import type { ImageSourcePropType } from 'react-native';
import { countingToTenCollection } from './collections/counting-to-ten';
import { inTheParkCollection } from './collections/in-the-park';
import { leosFavoriteNapDaysCollection } from './collections/leos-favorite-nap-days';
import { onThePlainsCollection } from './collections/on-the-plains';
import { theColorsOfBirdsCollection } from './collections/the-colors-of-birds';
import { theSnowCapitalCollection } from './collections/the-snow-capital';
import { toBeACatCollection } from './collections/to-be-a-cat';

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
 * Active stamp collections
 */
export const collectionAtlas: CollectionAtlas = {
	collections: [
		leosFavoriteNapDaysCollection,
		onThePlainsCollection,
		countingToTenCollection,
		theSnowCapitalCollection,
		toBeACatCollection,
		theColorsOfBirdsCollection,
		inTheParkCollection,
	],
};
