import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';

/**
 * Typing
 */
export type ProgressType = 'story' | 'chapter' | 'deck';

export interface UnlockRequirement {
	id: string;
	requiredCompletionPercentage: number;
}

export interface Progression {
	id: string;
	unlockRequirements?: UnlockRequirement[];
}

export interface UserProgressRow {
	userId: string;
	id: string;
	type: ProgressType;
	completionPercentage: number;
}

export type ProgressById = Record<string, UserProgressRow>;

/**
 * Calculate one stored completion percentage
 */
export function getCompletionPercentage({
	wordCount,
	wordProgressCounts,
}: {
	wordCount: number;
	wordProgressCounts: Pick<
		DeckWordProgressCounts,
		'new' | 'learning' | 'familiar' | 'known' | 'mastered'
	>;
}): number {
	if (wordCount === 0) return 0;

	/**
	 * Each progress stage is worth more points.
	 * These values preserve the existing completion and unlock behavior.
	 */
	const earnedPoints =
		wordProgressCounts.new * 0.5 +
		wordProgressCounts.learning +
		wordProgressCounts.familiar * 2 +
		wordProgressCounts.known * 3 +
		wordProgressCounts.mastered * 4;

	const possiblePoints = wordCount * 4;

	return (earnedPoints / possiblePoints) * 100;
}
