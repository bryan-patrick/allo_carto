import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveAnswerResult } from '@/src/util/solveAnswer';

export interface SolvePosition {
	position: number;
	text: string;
	after?: string;
	wordId?: string;
	englishWords: string[];
	acceptedAnswer: string | null;
}

export interface SolvePuzzle {
	deck: CardDeck;
	positions: SolvePosition[];
	isUnlocked: boolean;
	allWordsSeen: boolean;
}

export interface SolveAttemptRequest {
	deckId: string;
	position: number;
	answer: string;
	attemptId: string;
}

export interface SolveAttemptResult {
	status: SolveAnswerResult['status'] | 'notEnoughInk' | 'alreadySolved' | 'unavailable';
	acceptedAnswer: string | null;
	inkSpent: number;
}
