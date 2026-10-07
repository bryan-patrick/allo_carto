import type { WordProgressKey } from '@/src/util/wordProgress';

/**
 * Typing
 */
export interface WordAnswerAwardProps {
	xp: number;
	learningBonusXP: number;
	previousProgress: WordProgressKey;
	nextProgress: WordProgressKey;
}

export interface DeckWordResultProps {
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
	bonuses: XPBonusProps[];
	totalXP: number;
}

export interface DeckSessionProps {
	id: string;
	xpBefore: number;
	results: DeckWordResultProps[];
	completion?: DeckCompletionReceiptProps;
}
