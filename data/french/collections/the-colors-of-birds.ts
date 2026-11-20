import type { VocabularyCollection } from '../collectionAtlas';
import { collectionLevelRewards } from './learning-level-rewards';

/**
 * Collection details and stamps from the active story
 */
export const theColorsOfBirdsCollection: VocabularyCollection = {
	id: 'the-colors-of-birds',
	name: 'The Colors Of Birds',
	description: 'Find the purple bird at the park.',
	words: [
		{
			wordId: 'word_adjective_violet',
		},
	],
	rewards: collectionLevelRewards,
};
