import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const leosFavoriteNapDaysCollection: VocabularyCollection = {
	id: 'leos-favorite-nap-days',
	name: "Leo's Favorite Nap Days",
	description: 'A warm Monday is a good day for a nap.',
	words: [
		{
			wordId: 'word_noun_lundi',
		},
	],
	rewards: collectionLevelRewards,
};
