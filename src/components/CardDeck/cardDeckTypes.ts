import type { Progression } from '@/src/util/progression';

/**
 * Typing
 */
export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type WordForm =
	| 'contraction'
	| 'feminine'
	| 'imperfect'
	| 'infinitive'
	| 'masculine'
	| 'past participle'
	| 'plural'
	| 'possessive'
	| 'present';

export interface DeckColors {
	dark: Record<'primary' | 'secondary', string>;
	light: Record<'primary' | 'secondary', string>;
}

export interface DeckWordChoice {
	englishWords: string[];
	partOfSpeech?: string;
}

export interface StorySegment {
	text: string;
	wordId?: string;
	after?: string;
}

export interface CardDeck extends Progression {
	id: string;
	title: string;
	CEFR: CEFR[];
	description: string;
	wordIds: string[];
	words: Word[];
	wordChoices: DeckWordChoice[];
	place: string;
	colors: DeckColors;
	story?: StorySegment[];
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
	form?: WordForm;
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
