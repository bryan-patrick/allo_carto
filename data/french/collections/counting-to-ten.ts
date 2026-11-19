import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const countingToTenCollection: VocabularyCollection = {
	id: 'counting-to-ten',
	name: 'Counting To Ten',
	description: 'Start counting with the two birds Léo sees.',
	words: [
		{
			wordId: 'word_numeral_deux',
		},
	],
	rewards: collectionLevelRewards,
};
