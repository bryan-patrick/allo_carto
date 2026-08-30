import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type WordProgressKey = 'unseen' | 'new' | 'learning' | 'familiar' | 'known' | 'mastered';

export interface WordProgressDefinition {
	key: WordProgressKey;
	name: string;
	minCorrectCount: number;
	iconName: ComponentProps<typeof MaterialIcons>['name'];
}

export const wordProgressDefinitions: WordProgressDefinition[] = [
	{
		key: 'unseen',
		name: 'Unseen',
		minCorrectCount: 0,
		iconName: 'fiber-new',
	},
	{
		key: 'new',
		name: 'New',
		minCorrectCount: 0,
		iconName: 'fiber-new',
	},
	{
		key: 'learning',
		name: 'Learning',
		minCorrectCount: 3,
		iconName: 'school',
	},
	{
		key: 'familiar',
		name: 'Familiar',
		minCorrectCount: 7,
		iconName: 'task-alt',
	},
	{
		key: 'known',
		name: 'Known',
		minCorrectCount: 12,
		iconName: 'book',
	},
	{
		key: 'mastered',
		name: 'Mastered',
		minCorrectCount: 15,
		iconName: 'star',
	},
];

export const visibleWordProgressDefinitions = wordProgressDefinitions.filter(
	({ key }) => key !== 'unseen',
);

export function getWordProgressDefinitionFromCorrectCount(
	correctCount: number = 0,
): WordProgressDefinition {
	const normalizedCorrectCount = Math.max(correctCount, 0);
	let matchingProgress = wordProgressDefinitions[1];

	for (let index = wordProgressDefinitions.length - 1; index >= 1; index--) {
		const progress = wordProgressDefinitions[index];

		if (normalizedCorrectCount >= progress.minCorrectCount) {
			matchingProgress = progress;
			break;
		}
	}

	return matchingProgress;
}

/**
 * Get a word's progress from its stored userWords counts.
 */
export function getWordProgressKeyFromCounts({
	correctCount = 0,
	seenCount = 0,
}: {
	correctCount?: number;
	seenCount?: number;
}): WordProgressKey {
	if (correctCount === 0 && seenCount === 0) {
		return 'unseen';
	}

	return getWordProgressDefinitionFromCorrectCount(correctCount).key;
}

export function getWordProgressDefinitionByKey(
	progressKey: WordProgressKey,
): WordProgressDefinition {
	return (
		wordProgressDefinitions.find(({ key }) => key === progressKey) ?? wordProgressDefinitions[0]
	);
}

export function getWordProgressSqlCountSelect(
	correctCountExpression: string = 'uw.correctCount',
	seenCountExpression: string = 'uw.seenCount',
) {
	const normalizedCorrectCount = `COALESCE(${correctCountExpression}, 0)`;
	const normalizedSeenCount = `COALESCE(${seenCountExpression}, 0)`;

	return wordProgressDefinitions
		.map((progress, index) => {
			const nextProgress = wordProgressDefinitions[index + 1];
			let condition = `${normalizedCorrectCount} >= ${progress.minCorrectCount}`;

			if (progress.key === 'unseen') {
				condition = `${normalizedCorrectCount} = 0 AND ${normalizedSeenCount} = 0`;
			} else if (progress.key === 'new') {
				condition = `(${normalizedCorrectCount} > 0 OR ${normalizedSeenCount} > 0) AND ${normalizedCorrectCount} < ${nextProgress?.minCorrectCount ?? 0}`;
			} else if (nextProgress) {
				condition = `${normalizedCorrectCount} >= ${progress.minCorrectCount} AND ${normalizedCorrectCount} < ${nextProgress.minCorrectCount}`;
			}

			return `SUM(CASE WHEN ${condition} THEN 1 ELSE 0 END) AS ${progress.key}`;
		})
		.join(',');
}
