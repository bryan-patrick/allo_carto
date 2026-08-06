import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type WordRankKey =
	'unseen' | 'fnew' | 'bronze' | 'silver' | 'gold' | 'diamond';
export type WordProgressKey = WordRankKey;

export interface WordRankDefinition {
	key: WordRankKey;
	name: string;
	minCorrectCount: number;
	iconName: ComponentProps<typeof MaterialIcons>['name'];
}

export const wordRankDefinitions: WordRankDefinition[] = [
	{
		key: 'unseen',
		name: 'Unseen',
		minCorrectCount: 0,
		iconName: 'visibility-off',
	},
	{
		key: 'fnew',
		name: 'New',
		minCorrectCount: 0,
		iconName: 'fiber-new',
	},
	{
		key: 'bronze',
		name: 'Bronze',
		minCorrectCount: 3,
		iconName: 'stars',
	},
	{
		key: 'silver',
		name: 'Silver',
		minCorrectCount: 7,
		iconName: 'military-tech',
	},
	{
		key: 'gold',
		name: 'Gold',
		minCorrectCount: 12,
		iconName: 'emoji-events',
	},
	{
		key: 'diamond',
		name: 'Diamond',
		minCorrectCount: 15,
		iconName: 'diamond',
	},
];

export function getWordRankDefinitionFromCorrectCount(
	correctCount: number = 0,
): WordRankDefinition {
	const normalizedCorrectCount = Math.max(correctCount, 0);
	let matchingRank = wordRankDefinitions[0];

	for (let index = wordRankDefinitions.length - 1; index >= 0; index--) {
		const rank = wordRankDefinitions[index];

		if (normalizedCorrectCount >= rank.minCorrectCount) {
			matchingRank = rank;
			break;
		}
	}

	return matchingRank;
}

/**
 * Get the word's rank from its stored userWords counts
 */
export function getWordRankKeyFromCounts({
	correctCount = 0,
	seenCount = 0,
}: {
	correctCount?: number;
	seenCount?: number;
}): WordRankKey {
	if (correctCount === 0 && seenCount === 0) {
		return 'unseen';
	}

	return getWordRankDefinitionFromCorrectCount(correctCount).key;
}

export function getWordRankDefinitionByKey(
	rankKey: WordRankKey,
): WordRankDefinition {
	let matchingRank = wordRankDefinitions[0];

	for (const rank of wordRankDefinitions) {
		if (rank.key === rankKey) {
			matchingRank = rank;
		}
	}

	return matchingRank;
}

export function getWordRankSqlCountSelect(
	correctCountExpression: string = 'uw.correctCount',
	seenCountExpression: string = 'uw.seenCount',
) {
	const normalizedCorrectCount = `COALESCE(${correctCountExpression}, 0)`;
	const normalizedSeenCount = `COALESCE(${seenCountExpression}, 0)`;

	return wordRankDefinitions
		.map((rank, index) => {
			const nextRank = wordRankDefinitions[index + 1];
			let condition = `${normalizedCorrectCount} >= ${rank.minCorrectCount}`;

			if (rank.key === 'unseen') {
				condition = `${normalizedCorrectCount} = 0 AND ${normalizedSeenCount} = 0`;
			} else if (rank.key === 'fnew') {
				condition = `(${normalizedCorrectCount} > 0 OR ${normalizedSeenCount} > 0) AND ${normalizedCorrectCount} < ${nextRank?.minCorrectCount ?? 0}`;
			} else if (nextRank) {
				condition = `${normalizedCorrectCount} >= ${rank.minCorrectCount} AND ${normalizedCorrectCount} < ${nextRank.minCorrectCount}`;
			}

			return `SUM(CASE WHEN ${condition} THEN 1 ELSE 0 END) AS ${rank.key}`;
		})
		.join(',');
}
