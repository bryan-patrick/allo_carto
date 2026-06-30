import type { CardRarity, CEFR, Word } from '../components/CardDeck/cardDeckTypes';

export interface WordRow {
	id: string;
	frenchWord: string;
	englishWords: string;
	frenchArticle?: string;
	englishArticle?: string;
	pronunciation: string;
	isVulgar: number;
	CEFR: CEFR;
	lemmaId?: string;
	tense?: string;
	gender?: Word['gender'];
	partOfSpeech?: string;
	correctCount: number;
	rarity?: CardRarity;
	userCorrectCount: number;
}
