import { ImageSourcePropType } from 'react-native';

/**
 * Typing
 */
export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type DeckColors = Record<'dark' | 'light', string>;

export interface CardDeck {
	title: string;
	CEFR: CEFR[];
	description: string;
	wordIds: string[];
	words: Word[];
	image: ImageSourcePropType | undefined;
	wordChoices: string[];
	place?: string;
	colors?: DeckColors;
}

/**
 * Word type
 * As a general rule, ids should always be slug-safe (no accents or anything)
 * IDs are "word_partOfSpeech_frenchword(no special chars)"
 * E.G. "word_noun_apres" (note the lack of the accent over the é)
 *
 * Important: prop frenchWord ALWAYS gets its special characters.
 */
export interface Word {
	id: string;
	frenchWord: string;
	englishWords: string[];
	frenchArticle?: string;
	englishArticle?: string;
	pronunciation: string;
	isVulgar: boolean;
	CEFR: CEFR;
	lemmaId?: string;
	tense?: string;
	gender?: 'Feminine' | 'Masculine';
	partOfSpeech?: string;
	correctCount: number;
	rarity?: CardRarity;
}

export const initialWordState: Word = {
	id: '',
	frenchWord: '',
	englishWords: [''],
	pronunciation: '',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 0,
};
