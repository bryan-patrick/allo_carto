import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const theSnowCapitalCollection: VocabularyCollection = {
	id: 'the-snow-capital',
	name: 'The Snow Capital',
	description: 'Discover the snow coming to Québec City.',
	words: [
		{
			wordId: 'word_noun_neige',
		},
	],
	rewards: collectionLevelRewards,
};
