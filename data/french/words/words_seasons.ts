import type { Word } from '@/src/components/CardDeck/cardDeckTypes';

/*
 * Adds the missing season words for collections and future stories.
 */
export const words_seasons: Word[] = [
	{
		id: 'word_noun_printemps',
		frenchWord: 'printemps',
		englishWords: ['spring'],
		frenchArticle: 'le',
		englishArticle: 'the',
		pronunciation: 'luh pran-tahn',
		ipaPronunciation: 'lə pʁɛ̃tɑ̃',
		CEFR: 'A1',
		partOfSpeech: 'noun',
		gender: 'Masculine',
		lemmaId: 'printemps',
		form: 'masculine',
		rarity: 'Common',
		isVulgar: false,
		correctCount: 0,
	},
	{
		id: 'word_noun_hiver',
		frenchWord: 'hiver',
		englishWords: ['winter'],
		frenchArticle: "l'",
		englishArticle: 'the',
		pronunciation: 'lee-vair',
		ipaPronunciation: 'livɛʁ',
		CEFR: 'A1',
		partOfSpeech: 'noun',
		gender: 'Masculine',
		lemmaId: 'hiver',
		form: 'masculine',
		rarity: 'Common',
		isVulgar: false,
		correctCount: 0,
	},
];
