export type WordProgressKey = 'unseen' | 'new' | 'learning' | 'familiar' | 'known' | 'mastered';

export interface WordProgressDefinition {
	key: WordProgressKey;
	name: string;
	minCorrectCount: number;
	symbolName: string;
}

export const wordProgressDefinitions: WordProgressDefinition[] = [
	{
		key: 'unseen',
		name: 'Unseen',
		minCorrectCount: 0,
		symbolName: 'question_mark',
	},
	{
		key: 'new',
		name: 'New',
		minCorrectCount: 1,
		symbolName: 'featured_seasonal_and_gifts',
	},
	{
		key: 'learning',
		name: 'Learning',
		minCorrectCount: 2,
		symbolName: 'school',
	},
	{
		key: 'familiar',
		name: 'Familiar',
		minCorrectCount: 5,
		symbolName: 'person_celebrate',
	},
	{
		key: 'known',
		name: 'Known',
		minCorrectCount: 7,
		symbolName: 'cognition_2',
	},
	{
		key: 'mastered',
		name: 'Mastered',
		minCorrectCount: 10,
		symbolName: 'star',
	},
];

interface WordProgressCounts {
	correctCount?: number;
	seenCount?: number;
}

export function getWordProgressDefinition({
	correctCount = 0,
	seenCount = 0,
}: WordProgressCounts = {}): WordProgressDefinition {
	const normalizedCorrectCount = Math.max(correctCount, 0);

	if (normalizedCorrectCount === 0 && seenCount === 0) {
		return wordProgressDefinitions[0];
	}

	for (let index = wordProgressDefinitions.length - 1; index >= 1; index--) {
		const progress = wordProgressDefinitions[index];

		if (normalizedCorrectCount >= progress.minCorrectCount) {
			return progress;
		}
	}

	return wordProgressDefinitions[1];
}

/**
 * Get a word's progress from its stored userWords counts.
 */
export function getWordProgressKeyFromCounts({
	correctCount = 0,
	seenCount = 0,
}: WordProgressCounts): WordProgressKey {
	return getWordProgressDefinition({ correctCount, seenCount }).key;
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
