import { CEFR, Word } from '@/src/components/CardDeck/cardDeckTypes';

export interface CardDeck {
	CEFR: CEFR[];
	wordIds: string[];
	words: Word[];
}
