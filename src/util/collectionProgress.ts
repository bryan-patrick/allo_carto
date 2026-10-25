import type { UserProgressRow } from './progression';
import { wordProgressDefinitions, type WordProgressKey } from './wordProgress';

/**
 * Starting from the bottom, the lowest level that has cards is the collection level
 * Since all cards (words) must be at the level to be on that level (gem or w/e)
 */
export function getCollectionLevel(progress?: UserProgressRow): WordProgressKey {
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
 * Returns all of the words at a given "level" (learning level, new, learning, mastered, etc.)
 */
export function getWordsAtLevel(
	progress: UserProgressRow | undefined,
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
 * Checks whether every word in a story, chapter, or paragraph
 * has reached the requested level or higher.
 */
export function hasCollectionLevel(
	progress: UserProgressRow | undefined,
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
