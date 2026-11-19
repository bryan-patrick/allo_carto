import colors from '@/src/app/colors';
import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import { inkConfig } from './ink';
import type { UserProgressRow } from './progression';

/**
 * Typing
 */
export type CompletedSolveStages = 0 | 1 | 2 | 3 | 4 | 5;
export type SolveStage = Exclude<CompletedSolveStages, 0>;
export type SolveWordStage = 1 | 2;
export type SolveSentenceStage = 4 | 5;
export type SolveChallengeType = 'word' | 'wordOrder' | 'sentence';
export type SolveAnswerLanguage = 'english' | 'french';
export type SolveLockReason =
	| 'completed'
	| 'paragraphLocked'
	| 'noWords'
	| 'unseenWords'
	| 'previousStageRequired'
	| 'playerLevelRequired';

export interface SolveStageDefinition {
	label: string;
	isImplemented: boolean;
	challengeType: SolveChallengeType;
	answerLanguage: SolveAnswerLanguage | null;
	fastUnlockLevel: number;
	normalUnlockLevel: number;
	cardCostIncrease: number;
	attemptInkCost: number | null;
	incorrectAttemptInkCost: number;
	buttonGradient: readonly [string, string, ...string[]];
	backgroundTint: string;
}

export interface SolveStageEligibilityOptions {
	stage: SolveStage;
	completedStages: CompletedSolveStages;
	playerLevel: number;
	fastSolveUnlocks: boolean;
	isParagraphUnlocked: boolean;
	wordCount: number;
	seenWordCount: number;
	chapterUnlockLevel?: number;
}

export interface SolveStageEligibility {
	isEligible: boolean;
	lockReason: SolveLockReason | null;
	requiredPlayerLevel: number;
}

/**
 * Keeps the names, required player levels, Ink prices, and colors for all five puzzles in one place.
 */
export const solveStages: Record<SolveStage, SolveStageDefinition> = {
	1: {
		label: 'Puzzle 1',
		isImplemented: true,
		challengeType: 'word',
		answerLanguage: 'english',
		fastUnlockLevel: 0,
		normalUnlockLevel: 0,
		cardCostIncrease: 0,
		attemptInkCost: null,
		incorrectAttemptInkCost: inkConfig.incorrectSolveAttempt,
		buttonGradient: ['#F8DFD4', '#DC9ABF'],
		backgroundTint: `${colors.gems.first}0A`,
	},
	2: {
		label: 'Puzzle 2',
		isImplemented: true,
		challengeType: 'word',
		answerLanguage: 'french',
		fastUnlockLevel: 0,
		normalUnlockLevel: 0,
		cardCostIncrease: 1,
		attemptInkCost: null,
		incorrectAttemptInkCost: inkConfig.incorrectSolveAttempt + 1,
		buttonGradient: ['#D5EEE9', '#A4BEE5'],
		backgroundTint: `${colors.gems.second}0A`,
	},
	3: {
		label: 'Puzzle 3',
		isImplemented: true,
		challengeType: 'wordOrder',
		answerLanguage: null,
		fastUnlockLevel: 0,
		normalUnlockLevel: 0,
		cardCostIncrease: 0,
		attemptInkCost: 5,
		incorrectAttemptInkCost: 5,
		buttonGradient: ['#DDE2F8', '#C69ADA'],
		backgroundTint: `${colors.gems.third}0A`,
	},
	4: {
		label: 'Puzzle 4',
		isImplemented: true,
		challengeType: 'sentence',
		answerLanguage: 'english',
		fastUnlockLevel: 4,
		normalUnlockLevel: 15,
		cardCostIncrease: 0,
		attemptInkCost: 10,
		incorrectAttemptInkCost: 10,
		buttonGradient: ['#EBCFF0', '#AA8AD0'],
		backgroundTint: `${colors.gems.third}0A`,
	},
	5: {
		label: 'Puzzle 5',
		isImplemented: true,
		challengeType: 'sentence',
		answerLanguage: 'french',
		fastUnlockLevel: 5,
		normalUnlockLevel: 20,
		cardCostIncrease: 0,
		attemptInkCost: 10,
		incorrectAttemptInkCost: 10,
		buttonGradient: ['#F5DEA0', '#B9DCEC', '#F2C499', '#D8AFD9'],
		backgroundTint: `${colors.gems.third}0A`,
	},
};

/**
 * Reports how many puzzles have been completed for a paragraph, chapter, or story.
 */
export function getCompletedSolveStages(progress?: UserProgressRow): CompletedSolveStages {
	if (progress?.completedSolveStages !== undefined) {
		return progress.completedSolveStages;
	}

	return progress?.hasFirstGem ? 1 : 0;
}

/**
 * Finds the paragraph's next unfinished puzzle.
 */
export function getNextSolveStage(completedStages: CompletedSolveStages): SolveStage | null {
	if (completedStages === 5) {
		return null;
	}

	return (completedStages + 1) as SolveStage;
}

/**
 * Gets the ink cost
 */
export function getSolveCardInkCost(stage: SolveWordStage, rarity: CardRarity): number {
	const rarityCost = inkConfig.cardCostByRarity[rarity];
	const costIncrease = solveStages[stage].cardCostIncrease;
	const cardPrice = rarityCost + costIncrease;

	return cardPrice * 2;
}

/**
 * Decides whether the player can open a puzzle or what is keeping it locked.
 */
export function getSolveStageEligibility({
	stage,
	completedStages,
	playerLevel,
	fastSolveUnlocks,
	isParagraphUnlocked,
	wordCount,
	seenWordCount,
	chapterUnlockLevel,
}: SolveStageEligibilityOptions): SolveStageEligibility {
	const definition = solveStages[stage];
	let requiredPlayerLevel = definition.normalUnlockLevel;
	let lockReason: SolveLockReason | null = null;

	if (fastSolveUnlocks) {
		requiredPlayerLevel = definition.fastUnlockLevel;
	}

	if (chapterUnlockLevel !== undefined) {
		requiredPlayerLevel = chapterUnlockLevel;
	}

	if (stage <= completedStages) {
		lockReason = 'completed';
	} else if (!isParagraphUnlocked) {
		lockReason = 'paragraphLocked';
	} else if (wordCount === 0) {
		lockReason = 'noWords';
	} else if (stage > completedStages + 1) {
		lockReason = 'previousStageRequired';
	} else if (stage === 1 && seenWordCount < wordCount) {
		lockReason = 'unseenWords';
	} else if (playerLevel < requiredPlayerLevel) {
		lockReason = 'playerLevelRequired';
	}

	return {
		isEligible: lockReason === null,
		lockReason,
		requiredPlayerLevel,
	};
}

export interface SolveUnlockMessageOptions {
	stage: SolveStage;
	eligibility: SolveStageEligibility;
	seenWordCount: number;
	wordCount: number;
}

/**
 * Explains how to unlock a paragraph's puzzle.
 */
export function getSolveUnlockMessage({
	stage,
	eligibility,
	seenWordCount,
	wordCount,
}: SolveUnlockMessageOptions): string {
	const definition = solveStages[stage];
	const previousStage = stage > 1 ? ((stage - 1) as SolveStage) : null;
	const previousLabel = previousStage ? solveStages[previousStage].label : 'Puzzle';
	const messages: Record<SolveLockReason, string> = {
		completed: '',
		paragraphLocked: 'Complete 3 paragraph puzzles to unlock.',
		noWords: '',
		unseenWords: `See all cards to unlock puzzles (${seenWordCount} of ${wordCount}).`,
		previousStageRequired: `Complete ${previousLabel} to unlock ${definition.label}.`,
		playerLevelRequired: `${definition.label} unlocks at player level ${eligibility.requiredPlayerLevel}.`,
	};

	if (eligibility.lockReason) {
		return messages[eligibility.lockReason];
	}

	if (!definition.isImplemented) {
		return `${definition.label} will be available in a future update.`;
	}

	return '';
}
