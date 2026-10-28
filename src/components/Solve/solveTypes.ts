import type { CardDeck, CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveAnswerResult } from '@/src/util/solveAnswer';
import type { SolveStage } from '@/src/util/solveProgression';

export type AdditionalSolveStage = Exclude<SolveStage, 1>;

export interface SolveStageUnlockedPosition {
	position: number;
	wordId: string;
}

export interface SolveStageSolvedPosition {
	position: number;
	wordId: string | null;
	acceptedAnswer: string;
}

export interface SavedSolveStageProgress {
	stage: AdditionalSolveStage;
	unlockedPositions: SolveStageUnlockedPosition[];
	solvedPositions: SolveStageSolvedPosition[];
}

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
	hasFirstGem: boolean;
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
	firstGemEarned: boolean;
}
