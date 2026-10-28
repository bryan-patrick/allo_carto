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
}

export interface SolveStageEligibility {
	isEligible: boolean;
	lockReason: SolveLockReason | null;
	requiredPlayerLevel: number;
}

/**
 * Keeps the names, required player levels, Ink prices, and colors for all five Solve puzzles in one place.
 */
export const solveStages: Record<SolveStage, SolveStageDefinition> = {
	1: {
		label: 'Solve',
		isImplemented: true,
		challengeType: 'word',
		answerLanguage: 'english',
		fastUnlockLevel: 0,
		normalUnlockLevel: 0,
		cardCostIncrease: 0,
		attemptInkCost: null,
		incorrectAttemptInkCost: inkConfig.incorrectSolveAttempt,
		buttonGradient: [`${colors.gems.first}0D`, `${colors.gems.first}33`],
		backgroundTint: `${colors.gems.first}0A`,
	},
	2: {
		label: 'Solve+',
		isImplemented: true,
		challengeType: 'word',
		answerLanguage: 'french',
		fastUnlockLevel: 2,
		normalUnlockLevel: 5,
		cardCostIncrease: 1,
		attemptInkCost: null,
		incorrectAttemptInkCost: inkConfig.incorrectSolveAttempt + 1,
		buttonGradient: [`${colors.gems.second}0D`, `${colors.gems.second}33`],
		backgroundTint: `${colors.gems.second}0A`,
	},
	3: {
		label: 'Solve++',
		isImplemented: true,
		challengeType: 'wordOrder',
		answerLanguage: null,
		fastUnlockLevel: 3,
		normalUnlockLevel: 10,
		cardCostIncrease: 0,
		attemptInkCost: 10,
		incorrectAttemptInkCost: 10,
		buttonGradient: [`${colors.gems.third}0D`, `${colors.gems.third}33`],
		backgroundTint: `${colors.gems.third}0A`,
	},
	4: {
		label: 'Solve+++',
		isImplemented: true,
		challengeType: 'sentence',
		answerLanguage: 'english',
		fastUnlockLevel: 4,
		normalUnlockLevel: 15,
		cardCostIncrease: 0,
		attemptInkCost: 5,
		incorrectAttemptInkCost: 5,
		buttonGradient: [`${colors.gems.third}26`, `${colors.gems.third}59`],
		backgroundTint: `${colors.gems.third}0A`,
	},
	5: {
		label: 'Solve++++',
		isImplemented: false,
		challengeType: 'sentence',
		answerLanguage: 'french',
		fastUnlockLevel: 5,
		normalUnlockLevel: 20,
		cardCostIncrease: 0,
		attemptInkCost: 20,
		incorrectAttemptInkCost: 20,
		buttonGradient: [
			'rgb(248, 200, 8, 0.1)',
			'rgb(6, 164, 255, 0.1)',
			'rgba(255, 139, 6, 0.1)',
			'rgb(251, 6, 186, 0.1)',
		],
		backgroundTint: `${colors.gems.third}0A`,
	},
};

/**
 * Reports how many Solve puzzles have been completed for a paragraph, chapter, or story.
 */
export function getCompletedSolveStages(progress?: UserProgressRow): CompletedSolveStages {
	if (progress?.completedSolveStages !== undefined) {
		return progress.completedSolveStages;
	}

	return progress?.hasFirstGem ? 1 : 0;
}

/**
 * Finds the next puzzle for the Solve button.
 */
export function getNextSolveStage(completedStages: CompletedSolveStages): SolveStage | null {
	if (completedStages === 5) {
		return null;
	}

	return (completedStages + 1) as SolveStage;
}

/**
 * Prices card unlocks and correct answers in Solve and Solve+.
 */
export function getSolveCardInkCost(stage: SolveWordStage, rarity: CardRarity): number {
	const rarityCost = inkConfig.cardCostByRarity[rarity];
	const costIncrease = solveStages[stage].cardCostIncrease;

	return rarityCost + costIncrease;
}

/**
 * Decides whether the player can open a Solve puzzle or what is keeping it locked.
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

export interface SolveUnlockMessageOptions {
	stage: SolveStage;
	eligibility: SolveStageEligibility;
	seenWordCount: number;
	wordCount: number;
}

/**
 * Explains a locked Solve button beside the paragraph's other actions.
 */
export function getSolveUnlockMessage({
	stage,
	eligibility,
	seenWordCount,
	wordCount,
}: SolveUnlockMessageOptions): string {
	const definition = solveStages[stage];
	const previousStage = stage > 1 ? ((stage - 1) as SolveStage) : null;
	const previousLabel = previousStage ? solveStages[previousStage].label : 'Solve';
	const messages: Record<SolveLockReason, string> = {
		completed: '',
		paragraphLocked: 'Complete the earlier paragraphs to open this paragraph.',
		noWords: '',
		unseenWords: `Solve unlocks when you have seen every flashcard (${seenWordCount} of ${wordCount} seen).`,
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
