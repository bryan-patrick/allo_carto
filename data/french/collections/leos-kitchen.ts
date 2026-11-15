import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import type { VocabularyCollection } from '../collectionAtlas';

/**
 * Keep dictionary details for kitchen stamps that are outside the current story.
 * Bread uses its existing word from Leo and Poe.
 */
export const leosKitchenWords: Word[] = [
	{
		id: 'word_noun_croissant',
		frenchWord: 'croissant',
		englishWords: ['croissant'],
		canonicalEnglish: 'croissant',
		pronunciation: 'luh krwah-sahn',
		ipaPronunciation: 'lə kʁwɑsɑ̃',
		CEFR: 'A1',
		partOfSpeech: 'noun',
		rarity: 'Common',
		frenchArticle: 'le',
		englishArticle: 'the',
		gender: 'Masculine',
		lemmaId: 'croissant',
		form: 'masculine',
		isVulgar: false,
		correctCount: 0,
	},
	{
		id: 'word_noun_grille_pain',
		frenchWord: 'grille-pain',
		englishWords: ['toaster'],
		canonicalEnglish: 'toaster',
		pronunciation: 'luh greey-pan',
		ipaPronunciation: 'lə gʁɪjpɛ̃',
		CEFR: 'A2',
		partOfSpeech: 'noun',
		rarity: 'Epic',
		frenchArticle: 'le',
		englishArticle: 'the',
		gender: 'Masculine',
		lemmaId: 'grille_pain',
		form: 'masculine',
		isVulgar: false,
		correctCount: 0,
	},
	{
		id: 'word_noun_fromage',
		frenchWord: 'fromage',
		englishWords: ['cheese'],
		canonicalEnglish: 'cheese',
		pronunciation: 'luh froh-mahzh',
		ipaPronunciation: 'lə fʁɔmaʒ',
		CEFR: 'A1',
		partOfSpeech: 'noun',
		rarity: 'Common',
		frenchArticle: 'le',
		englishArticle: 'the',
		gender: 'Masculine',
		lemmaId: 'fromage',
		form: 'masculine',
		isVulgar: false,
		correctCount: 0,
	},
];

/**
 * Restore Léo’s kitchen stamps and their original learning rewards, with bread added.
 */
export const leosKitchenCollection: VocabularyCollection = {
	id: 'leos-kitchen',
	name: 'Léo’s Kitchen',
	description: 'Bread, a croissant, a toaster, and a little cheese from Léo’s kitchen.',
	words: [
		{
			wordId: 'word_noun_croissant',
		},
		{
			wordId: 'word_noun_grille_pain',
		},
		{
			wordId: 'word_noun_fromage',
		},
		{
			wordId: 'word_noun_pain',
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
