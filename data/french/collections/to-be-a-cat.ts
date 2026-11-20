import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const toBeACatCollection: VocabularyCollection = {
	id: 'to-be-a-cat',
	name: 'To Be A Cat',
	description: 'Sleep and take a nap like Léo.',
	words: [
		{
			wordId: 'word_noun_sieste',
		},
		{
			wordId: 'word_verb_dors',
		},
	],
	rewards: collectionLevelRewards,
};
