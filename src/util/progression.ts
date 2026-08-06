import type { DeckRankCounts } from '@/src/db/queries/getDeckRankCounts';

/**
 * Typing
 */
export type ProgressType = 'chapter' | 'place' | 'deck';

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
 * Check all unlock requirements
 */
export function isUnlocked({
	requirements = [],
	progressById,
}: {
	requirements?: UnlockRequirement[];
	progressById: ProgressById;
}): boolean {
	let result = true;

	for (const requirement of requirements) {
		const completion = progressById[requirement.id]?.completionPercentage ?? 0;

		if (completion < requirement.requiredCompletionPercentage) {
			result = false;
			break;
		}
	}

	return result;
}

/**
 * Calculate one stored completion percentage
 */
export function getCompletionPercentage({
	wordCount,
	rankCounts,
}: {
	wordCount: number;
	rankCounts: Pick<DeckRankCounts, 'fnew' | 'bronze' | 'silver' | 'gold' | 'diamond'>;
}): number {
	if (wordCount === 0) return 0;

	/**
	 * Each rank is worth more points
	 */
	const earnedPoints =
		rankCounts.fnew * 0.5 +
		rankCounts.bronze +
		rankCounts.silver * 2 +
		rankCounts.gold * 3 +
		rankCounts.diamond * 4;

	const possiblePoints = wordCount * 4;

	return (earnedPoints / possiblePoints) * 100;
}
