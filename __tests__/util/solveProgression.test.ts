import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import {
	getCompletedSolveStages,
	getNextSolveStage,
	getSolveCardInkCost,
	getSolveStageEligibility,
	solveStages,
	type CompletedSolveStages,
	type SolveStage,
	type SolveStageEligibilityOptions,
} from '@/src/util/solveProgression';

const eligibleOptions: SolveStageEligibilityOptions = {
	stage: 1,
	completedStages: 0,
	playerLevel: 1,
	fastSolveUnlocks: true,
	isParagraphUnlocked: true,
	wordCount: 2,
	seenWordCount: 2,
};

interface StageRequirementCase {
	stage: SolveStage;
	completedStages: CompletedSolveStages;
	fastLevel: number;
	normalLevel: number;
}

const stageRequirements: StageRequirementCase[] = [
	{
		stage: 2,
		completedStages: 1,
		fastLevel: 2,
		normalLevel: 5,
	},
	{
		stage: 3,
		completedStages: 2,
		fastLevel: 3,
		normalLevel: 10,
	},
	{
		stage: 4,
		completedStages: 3,
		fastLevel: 4,
		normalLevel: 15,
	},
	{
		stage: 5,
		completedStages: 4,
		fastLevel: 5,
		normalLevel: 20,
	},
];

describe('Solve progression', () => {
	test('keeps Stage 1 available at the starting player level only after every word is seen', () => {
		expect(getSolveStageEligibility(eligibleOptions).isEligible).toBe(true);
		expect(
			getSolveStageEligibility({
				...eligibleOptions,
				fastSolveUnlocks: false,
			}).isEligible,
		).toBe(true);
		expect(
			getSolveStageEligibility({
				...eligibleOptions,
				seenWordCount: 1,
			}).lockReason,
		).toBe('unseenWords');
	});

	test.each(stageRequirements)(
		'opens stage $stage at its fast or normal level only after the preceding stage',
		({ stage, completedStages, fastLevel, normalLevel }) => {
			for (const fastSolveUnlocks of [true, false]) {
				const requiredLevel = fastSolveUnlocks ? fastLevel : normalLevel;
				const options: SolveStageEligibilityOptions = {
					...eligibleOptions,
					stage,
					completedStages,
					fastSolveUnlocks,
					playerLevel: requiredLevel - 1,
				};

				expect(getSolveStageEligibility(options).lockReason).toBe('playerLevelRequired');
				expect(
					getSolveStageEligibility({
						...options,
						playerLevel: requiredLevel,
					}).isEligible,
				).toBe(true);

				for (let previousStages = 0; previousStages < completedStages; previousStages++) {
					expect(
						getSolveStageEligibility({
							...options,
							completedStages: previousStages as CompletedSolveStages,
							playerLevel: 30,
						}).lockReason,
					).toBe('previousStageRequired');
				}
			}
		},
	);

	test('keeps completed stages complete even when normal requirements are higher', () => {
		const result = getSolveStageEligibility({
			...eligibleOptions,
			stage: 4,
			completedStages: 4,
			playerLevel: 4,
			fastSolveUnlocks: false,
		});

		expect(result.lockReason).toBe('completed');
		expect(getNextSolveStage(4)).toBe(5);
		expect(getNextSolveStage(5)).toBeNull();
	});

	test('does not open locked or empty paragraphs at a high player level', () => {
		expect(
			getSolveStageEligibility({
				...eligibleOptions,
				playerLevel: 30,
				isParagraphUnlocked: false,
			}).lockReason,
		).toBe('paragraphLocked');
		expect(
			getSolveStageEligibility({
				...eligibleOptions,
				playerLevel: 30,
				wordCount: 0,
			}).lockReason,
		).toBe('noWords');
	});

	test('recognizes existing first gems without treating vocabulary as puzzle completion', () => {
		const progress = {
			userId: 'user_one',
			id: 'deck_one',
			type: 'paragraph' as const,
			completionPercentage: 100,
			hasFirstGem: true,
		};

		expect(getCompletedSolveStages(progress)).toBe(1);
		expect(
			getCompletedSolveStages({
				...progress,
				hasFirstGem: false,
			}),
		).toBe(0);
		expect(getCompletedSolveStages()).toBe(0);
	});

	test('adds one Ink to every Solve+ word price without changing Stage 1 prices', () => {
		const rarities: CardRarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

		for (const rarity of rarities) {
			expect(getSolveCardInkCost(2, rarity)).toBe(getSolveCardInkCost(1, rarity) + 1);
		}

		expect(solveStages[1].incorrectAttemptInkCost).toBe(1);
		expect(solveStages[2].incorrectAttemptInkCost).toBe(2);
		expect(getSolveCardInkCost(2, 'Legendary')).toBe(6);
	});
});
