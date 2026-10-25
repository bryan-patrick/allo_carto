import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import type { WordProgressKey } from './wordProgress';

/**
 * Typing
 */
export type ProgressType = 'story' | 'chapter' | 'paragraph';

export interface UnlockRequirement {
	id: string;
	requiredWordProgress: Exclude<WordProgressKey, 'unseen'>;
}

export interface Progression {
	id: string;
	requiredLevel?: number;
	unlockRequirements?: UnlockRequirement[];
}

export interface UserProgressRow {
	userId: string;
	id: string;
	type: ProgressType;
	completionPercentage: number;
	/**
	 * Calculated from distinct encountered words when loading progress.
	 */
	seenPercentage?: number;
	seenWordCount?: number;
	wordCount?: number;
	hasStartedFlashcards?: number;
	isUnlocked?: number;
	wordProgressCounts?: DeckWordProgressCounts;
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
	if (wordCount === 0) {
		return 0;
	}

	/**
	 * Each progress stage is worth more points.
	 * These values describe learned progress; gems use each word's actual level.
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
