import type { VocabularyCollection } from '../collectionAtlas';

/**
 * Defines the collection's name, its three stamps, and its XP rewards.
 */
export const ourFavoritePlacesCollection: VocabularyCollection = {
	id: 'our-favorite-places',
	name: 'Our favorite places',
	description: 'A convenience store, a bakery, and a park to visit together.',
	words: [
		{
			wordId: 'word_noun_depanneur',
		},
		{
			wordId: 'word_noun_boulangerie',
		},
		{
			wordId: 'word_noun_parc',
		},
	],
	rewards: [
		{
			requiredWordProgress: 'new',
			xp: 50,
		},
		{
			requiredWordProgress: 'learning',
			xp: 100,
		},
		{
			requiredWordProgress: 'familiar',
			xp: 150,
		},
		{
			requiredWordProgress: 'known',
			xp: 200,
		},
		{
			requiredWordProgress: 'mastered',
			xp: 250,
		},
	],
};
