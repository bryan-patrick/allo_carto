import type { CardDeck, CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveAnswerResult } from '@/src/util/solveAnswer';
import type {
	CompletedSolveStages,
	SolveStage,
	SolveStageEligibility,
	SolveWordStage,
} from '@/src/util/solveProgression';

/**
 * Typing
 */
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
	englishPrompt: string;
	frenchWords: string[];
	acceptedAnswer: string | null;
}

export interface SolvePuzzle extends SolveStageEligibility {
	deck: CardDeck;
	stage: SolveWordStage;
	completedSolveStages: CompletedSolveStages;
	positions: SolvePosition[];
	isUnlocked: boolean;
	allWordsSeen: boolean;
	hasFirstGem: boolean;
}

export interface SolveCardRequest {
	deckId: string;
	position: number;
	stage?: SolveWordStage;
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
	stageCompleted?: boolean;
}

export interface SolveWordOrderCard {
	id: number;
	text: string;
}

export interface WordOrderAttemptRequest {
	deckId: string;
	positions: number[];
	attemptId: string;
}

export interface SavedWordOrderAttempt {
	positions: number[];
	inkSpent: number;
	status: 'exact' | 'incorrect';
}

export interface SolveWordOrderPuzzle extends SolveStageEligibility {
	deck: CardDeck;
	isUnlocked: boolean;
	cards: SolveWordOrderCard[];
	positions: number[];
	completedSolveStages: CompletedSolveStages;
	lastAttempt: SavedWordOrderAttempt | null;
}

export interface SolveSentenceKeyword {
	englishWords: string[];
}

export interface SolveSentence {
	position: number;
	frenchText: string;
	englishText: string | null;
	keywords: SolveSentenceKeyword[];
	acceptedAnswer: string | null;
}

export interface SolveSentencePuzzle extends SolveStageEligibility {
	deck: CardDeck;
	isUnlocked: boolean;
	sentences: SolveSentence[];
	completedSolveStages: CompletedSolveStages;
}

export interface SentenceAttemptRequest {
	deckId: string;
	position: number;
	answer: string;
	attemptId: string;
}
