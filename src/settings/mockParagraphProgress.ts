import type { CompletedSolveStages } from '@/src/util/solveProgression';

export type MockParagraphPresetValue = CompletedSolveStages | 'firstGemUnclaimed';

interface MockParagraphPreset {
	value: MockParagraphPresetValue;
	label: string;
	description: string;
}

export const mockParagraphPresets: MockParagraphPreset[] = [
	{
		value: 0,
		label: 'No gems',
		description: 'Every paragraph has seen flashcards and no completed puzzles.',
	},
	{
		value: 'firstGemUnclaimed',
		label: 'First gem unclaimed',
		description: 'Every paragraph has Puzzle 1 solved and its first gem ready to claim.',
	},
	{
		value: 1,
		label: '1 gem',
		description: 'Every paragraph has completed Puzzle 1.',
	},
	{
		value: 2,
		label: '2 gems',
		description: 'Every paragraph has completed Puzzle 1 and Puzzle 2.',
	},
	{
		value: 3,
		label: '3 gems',
		description: 'Every paragraph has completed through Puzzle 3.',
	},
	{
		value: 4,
		label: 'Glowing gems',
		description: 'Every paragraph has completed through Puzzle 4.',
	},
	{
		value: 5,
		label: 'Prismatic gems',
		description: 'Every paragraph has completed all five puzzles.',
	},
];

/**
 * Checks a saved mock preset so debug settings only use supported completion states.
 */
export function isMockParagraphPreset(value: unknown): value is MockParagraphPresetValue {
	return mockParagraphPresets.some(preset => preset.value === value);
}
