import type { WordProgressKey } from '@/src/util/wordProgress';
import type { CardDeck } from './cardDeckTypes';

/**
 * Typing
 */
export interface LoadedFlashcardDeck {
	cardDeck: CardDeck;
	session: DeckSessionProps;
	currentIndex: number;
}

export interface WordAnswerAwardProps {
	ink: number;
	xp: number;
	learningBonusXP: number;
	previousProgress: WordProgressKey;
	nextProgress: WordProgressKey;
}

export interface DeckWordResultProps {
	ink: number;
	wordId: string;
	outcome: 'correct' | 'incorrect' | 'skipped';
	xp: number;
	learningBonusXP?: number;
	previousProgress?: WordProgressKey;
	nextProgress?: WordProgressKey;
}

export interface XPBonusProps {
	kind: 'completion' | 'firstCompletion' | 'perfect';
	xp: number;
}

export interface DeckCompletionReceiptProps {
	earnedInk: number;
	bonuses: XPBonusProps[];
	totalXP: number;
}

export interface DeckSessionProps {
	id: string;
	xpBefore: number;
	results: DeckWordResultProps[];
	unseenWordIds?: string[];
	completion?: DeckCompletionReceiptProps;
}
