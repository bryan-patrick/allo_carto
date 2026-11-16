import type { Progression } from '@/src/util/progression';

/**
 * Typing
 */
export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type WordForm =
	| 'contraction'
	| 'elision'
	| 'feminine'
	| 'imperfect'
	| 'infinitive'
	| 'masculine'
	| 'past participle'
	| 'past historic'
	| 'plural'
	| 'possessive'
	| 'present participle'
	| 'present';

export interface DeckWordChoice {
	englishWords: string[];
	partOfSpeech?: string;
}

export interface PassageSegment {
	text: string;
	wordId?: string;
	canonicalEnglish?: string;
	unlockExempt?: boolean;
	isLocked?: boolean;
	after?: string;
}

export interface ParagraphDefinition extends Progression {
	id: string;
	CEFR: CEFR[];
	description: string;
	passage: PassageSegment[];
	/**
	 * The matching English passage for sentence puzzles.
	 */
	englishPassage?: string;
	/**
	 * Allows a paragraph to accept more than one correct order in Solve++.
	 * Each answer lists the cards' passage positions in the accepted order.
	 */
	acceptedWordOrders?: number[][];
}

/**
 * Keep a paragraph's passage and learnable word IDs together.
 */
export interface Paragraph extends ParagraphDefinition {
	wordIds: string[];
}

export interface CardDeckDefinition extends ParagraphDefinition {
	words: Word[];
	wordChoices: DeckWordChoice[];
}

/**
 * Add the current flashcards and saved deck cycle to a paragraph.
 */
export interface CardDeck extends Paragraph {
	words: Word[];
	wordChoices: DeckWordChoice[];
	flashcardDecks?: string[][];
	flashcardProgress?: FlashcardDeckProgress;
}

export interface FlashcardDeckProgress {
	deckIndex: number;
	deckCount: number;
}

export type ReadingPassage = Pick<Paragraph, 'id' | 'passage' | 'wordIds'>;

/**
 * Word type
 *
 * As a general rule, ids should always be slug-safe (no accents or anything and yes I made a pun...uh...sort of)
 *
 * IDs are "word_partOfSpeech_frenchword(no special chars)"
 * E.G. "word_noun_apres" (note the lack of the accent over the é)
 *
 * Important: prop frenchWord ALWAYS gets its special characters.
 */
export interface WordElision {
	frenchWord: string;
	pronunciation: string;
	ipaPronunciation: string;
}

export interface Word {
	id: string;
	frenchWord: string;
	englishWords: string[];
	/**
	 * The full English meaning used in puzzles. A passage can choose a different meaning.
	 */
	canonicalEnglish?: string | null;
	elision?: WordElision;
	tipId?: string;
	frenchArticle?: string;
	englishArticle?: string;
	englishPrefixes?: string[];
	pronunciation: string;
	ipaPronunciation: string;
	isVulgar: boolean;
	isQuebecois?: boolean;
	CEFR: CEFR;
	lemmaId?: string;
	form?: WordForm;
	tense?: string;
	gender?: 'Feminine' | 'Masculine';
	partOfSpeech?: string;
	correctCount: number;
	seenCount?: number;
	rarity: CardRarity;
}

export const initialWordState: Word = {
	id: '',
	frenchWord: '',
	englishWords: [''],
	pronunciation: '',
	ipaPronunciation: '',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 0,
	seenCount: 0,
	rarity: 'Common',
};
