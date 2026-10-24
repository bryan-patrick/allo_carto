import type { UserProgressRow } from './progression';
import { wordProgressDefinitions, type WordProgressKey } from './wordProgress';

/** A collection earns the highest level reached by every one of its words. */
export function getCollectionLevel(progress?: UserProgressRow): WordProgressKey {
	const counts = progress?.wordProgressCounts;
	if (!progress?.wordCount || !counts) {
		return 'unseen';
	}

	return wordProgressDefinitions.find(level => counts[level.key] > 0)?.key ?? 'unseen';
}

export function getWordsAtLevel(
	progress: UserProgressRow | undefined,
	level: WordProgressKey,
): number {
	const levelIndex = wordProgressDefinitions.findIndex(definition => definition.key === level);
	return wordProgressDefinitions.slice(levelIndex).reduce((total, definition) => {
		return total + (progress?.wordProgressCounts?.[definition.key] ?? 0);
	}, 0);
}

export function hasCollectionLevel(
	progress: UserProgressRow | undefined,
	level: WordProgressKey,
): boolean {
	return Boolean(progress?.wordCount && getWordsAtLevel(progress, level) >= progress.wordCount);
}
