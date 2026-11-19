import type { CardRarity, CEFR, Word } from '../components/CardDeck/cardDeckTypes';

export interface WordRow {
	id: string;
	frenchWord: string;
	englishWords: string;
	canonicalEnglish?: string | null;
	tipId?: string | null;
	frenchArticle?: string;
	englishArticle?: string;
	englishPrefixes?: string | null;
	isEnglishPrefixReversed: number;
	pronunciation: string;
	ipaPronunciation: string;
	isVulgar: number;
	isQuebecois: number;
	CEFR: CEFR;
	lemmaId?: string;
	form?: Word['form'];
	tense?: string;
	gender?: Word['gender'];
	partOfSpeech?: string;
	correctCount: number;
	rarity: CardRarity;
	userCorrectCount: number;
}
