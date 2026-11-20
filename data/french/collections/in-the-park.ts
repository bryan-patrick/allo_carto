import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const inTheParkCollection: VocabularyCollection = {
	id: 'in-the-park',
	name: 'In The Park',
	description: 'Find Léo’s favorite tree at the park.',
	words: [
		{
			wordId: 'word_noun_arbre',
		},
	],
	rewards: collectionLevelRewards,
};
