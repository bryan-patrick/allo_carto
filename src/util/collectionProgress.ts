import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { wordProgressDefinitions, type WordProgressKey } from './wordProgress';

interface CollectionWordProgress {
	wordCount?: number;
	wordProgressCounts?: DeckWordProgressCounts;
}

/**
 * Gets the lowest word level to use as the collection's learning level.
 */
export function getCollectionLevel(progress?: CollectionWordProgress): WordProgressKey {
	const wordCount = progress?.wordCount ?? 0;
	const wordProgressCounts = progress?.wordProgressCounts;

	if (!wordCount || !wordProgressCounts) {
		return 'unseen';
	}

	for (const definition of wordProgressDefinitions) {
		const wordCountAtLevel = wordProgressCounts[definition.key];
		const hasWordsAtLevel = wordCountAtLevel > 0;

		if (hasWordsAtLevel) {
			return definition.key;
		}
	}

	return 'unseen';
}

/**
 * Counts words at or above a learning level to measure progress toward a goal.
 */
export function getWordsAtLevel(
	progress: CollectionWordProgress | undefined,
	level: WordProgressKey,
): number {
	const wordProgressCounts = progress?.wordProgressCounts;
	const levelIndex = wordProgressDefinitions.findIndex(definition => definition.key === level);
	const qualifyingLevels = wordProgressDefinitions.slice(levelIndex);
	let qualifyingWordCount = 0;

	for (const definition of qualifyingLevels) {
		const wordCountAtLevel = wordProgressCounts?.[definition.key] ?? 0;
		qualifyingWordCount += wordCountAtLevel;
	}

	return qualifyingWordCount;
}

/**
 * Checks whether every word has reached a learning level to unlock progress or rewards.
 */
export function hasCollectionLevel(
	progress: CollectionWordProgress | undefined,
	level: WordProgressKey,
): boolean {
	const totalWordCount = progress?.wordCount ?? 0;

	if (!totalWordCount) {
		return false;
	}

	const qualifyingWordCount = getWordsAtLevel(progress, level);
	const allWordsMeetLevel = qualifyingWordCount >= totalWordCount;

	return allWordsMeetLevel;
}
