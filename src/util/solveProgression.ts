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
export type SolveChallengeType = 'word' | 'reconstruction' | 'sentence';
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
	challengeType: SolveChallengeType;
	answerLanguage: SolveAnswerLanguage | null;
	fastUnlockLevel: number;
	normalUnlockLevel: number;
	cardCostIncrease: number;
	attemptInkCost: number | null;
	incorrectAttemptInkCost: number;
	buttonGradient: readonly [string, string] | null;
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
}

export interface SolveStageEligibility {
	isEligible: boolean;
	lockReason: SolveLockReason | null;
	requiredPlayerLevel: number;
}

/**
 * We use this table for each Solve stage's rules and colors.
 */
export const solveStages: Record<SolveStage, SolveStageDefinition> = {
	1: {
		label: 'Solve',
		challengeType: 'word',
		answerLanguage: 'english',
		fastUnlockLevel: 0,
		normalUnlockLevel: 0,
		cardCostIncrease: 0,
		attemptInkCost: null,
		incorrectAttemptInkCost: inkConfig.incorrectSolveAttempt,
		buttonGradient: null,
		backgroundTint: `${colors.gems.first}0A`,
	},
	2: {
		label: 'Solve+',
		challengeType: 'word',
		answerLanguage: 'french',
		fastUnlockLevel: 2,
		normalUnlockLevel: 5,
		cardCostIncrease: 1,
		attemptInkCost: null,
		incorrectAttemptInkCost: inkConfig.incorrectSolveAttempt + 1,
		buttonGradient: [`${colors.gems.second}26`, `${colors.categoryLight.Health}26`],
		backgroundTint: `${colors.gems.second}0A`,
	},
	3: {
		label: 'Solve++',
		challengeType: 'reconstruction',
		answerLanguage: null,
		fastUnlockLevel: 3,
		normalUnlockLevel: 10,
		cardCostIncrease: 0,
		attemptInkCost: 10,
		incorrectAttemptInkCost: 10,
		buttonGradient: [`${colors.gems.third}26`, `${colors.light.CEFR.A2}26`],
		backgroundTint: `${colors.gems.third}0A`,
	},
	4: {
		label: 'Solve+++',
		challengeType: 'sentence',
		answerLanguage: 'english',
		fastUnlockLevel: 4,
		normalUnlockLevel: 15,
		cardCostIncrease: 0,
		attemptInkCost: 15,
		incorrectAttemptInkCost: 15,
		buttonGradient: [`${colors.rarity.Legendary}26`, `${colors.gems.first}26`],
		backgroundTint: `${colors.rarity.Legendary}0A`,
	},
	5: {
		label: 'Solve++++',
		challengeType: 'sentence',
		answerLanguage: 'french',
		fastUnlockLevel: 5,
		normalUnlockLevel: 20,
		cardCostIncrease: 0,
		attemptInkCost: 20,
		incorrectAttemptInkCost: 20,
		buttonGradient: [`${colors.gems.second}26`, `${colors.gems.third}26`],
		backgroundTint: `${colors.gems.third}0A`,
	},
};

/**
 * Get the Solve puzzle progresseseseses
 */
export function getCompletedSolveStages(progress?: UserProgressRow): CompletedSolveStages {
	if (progress?.completedSolveStages !== undefined) {
		return progress.completedSolveStages;
	}

	return progress?.hasFirstGem ? 1 : 0;
}

/**
 * We offer the stage after the last completed puzzle (or no stage after the last).
 */
export function getNextSolveStage(completedStages: CompletedSolveStages): SolveStage | null {
	if (completedStages === 5) {
		return null;
	}

	return (completedStages + 1) as SolveStage;
}

/**
 * We use the same price for unlocking a word card and solving it correctly until Solve++
 */
export function getSolveCardInkCost(stage: SolveWordStage, rarity: CardRarity): number {
	const rarityCost = inkConfig.cardCostByRarity[rarity];
	const costIncrease = solveStages[stage].cardCostIncrease;

	return rarityCost + costIncrease;
}

/**
 * We check story access, earlier Solve stages, and player level before opening a puzzle.
 */
export function getSolveStageEligibility({
	stage,
	completedStages,
	playerLevel,
	fastSolveUnlocks,
	isParagraphUnlocked,
	wordCount,
	seenWordCount,
}: SolveStageEligibilityOptions): SolveStageEligibility {
	const definition = solveStages[stage];
	const requiredPlayerLevel =
		fastSolveUnlocks ? definition.fastUnlockLevel : definition.normalUnlockLevel;
	let lockReason: SolveLockReason | null = null;

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
