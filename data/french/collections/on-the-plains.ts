import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const onThePlainsCollection: VocabularyCollection = {
	id: 'on-the-plains',
	name: 'On the Plains',
	description: 'Meet Léo, a cat who lives in Québec City.',
	words: [
		{
			wordId: 'word_noun_chat',
		},
	],
	rewards: collectionLevelRewards,
};
