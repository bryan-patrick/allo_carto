import type { CardDeck, CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveAnswerResult } from '@/src/util/solveAnswer';

export interface SolvePosition {
	position: number;
	text: string;
	wordId?: string;
	rarity: CardRarity;
	isUnlocked: boolean;
	englishWords: string[];
	acceptedAnswer: string | null;
}

export interface SolvePuzzle {
	deck: CardDeck;
	positions: SolvePosition[];
	isUnlocked: boolean;
	allWordsSeen: boolean;
}

export interface SolveCardRequest {
	deckId: string;
	position: number;
}

export interface SolveAttemptRequest extends SolveCardRequest {
	answer: string;
	attemptId: string;
}

export interface SolveAttemptResult {
	status:
		| SolveAnswerResult['status']
		| 'notEnoughInk'
		| 'alreadySolved'
		| 'unavailable'
		| 'locked'
		| 'unlocked'
		| 'alreadyUnlocked';
	acceptedAnswer: string | null;
	inkSpent: number;
}
