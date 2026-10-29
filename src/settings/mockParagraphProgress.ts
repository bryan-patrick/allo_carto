import type { CompletedSolveStages } from '@/src/util/solveProgression';

interface MockParagraphPreset {
	completedStages: CompletedSolveStages;
	label: string;
	description: string;
}

export const mockParagraphPresets: MockParagraphPreset[] = [
	{
		completedStages: 0,
		label: 'No gems',
		description: 'Every paragraph has seen flashcards and no completed Solve puzzles.',
	},
	{
		completedStages: 1,
		label: '1 gem',
		description: 'Every paragraph has completed Solve.',
	},
	{
		completedStages: 2,
		label: '2 gems',
		description: 'Every paragraph has completed Solve and Solve+.',
	},
	{
		completedStages: 3,
		label: '3 gems',
		description: 'Every paragraph has completed through Solve++.',
	},
	{
		completedStages: 4,
		label: 'Glowing gems',
		description: 'Every paragraph has completed through Solve+++.',
	},
	{
		completedStages: 5,
		label: 'Prismatic gems',
		description: 'Every paragraph has completed all five Solve puzzles.',
	},
];

/**
 * Checks a saved mock preset so debug settings only use supported completion states.
 */
export function isMockParagraphPreset(value: unknown): value is CompletedSolveStages {
	return mockParagraphPresets.some(preset => preset.completedStages === value);
}
