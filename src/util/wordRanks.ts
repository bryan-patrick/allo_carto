import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type WordRankKey = 'fnew' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface WordRankDefinition {
	key: WordRankKey;
	name: string;
	minCorrectCount: number;
	iconName: ComponentProps<typeof MaterialIcons>['name'];
}

export const wordRankDefinitions: WordRankDefinition[] = [
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

export function getWordRankDefinition(score: number = 0): WordRankDefinition {
	const normalizedScore = Math.max(score, 0);

	for (let index = wordRankDefinitions.length - 1; index >= 0; index--) {
		const rank = wordRankDefinitions[index];

		if (normalizedScore >= rank.minCorrectCount) {
			return rank;
		}
	}

	return wordRankDefinitions[0];
}

export function getWordRankSqlCountSelect(
	correctCountExpression: string = 'uw.correctCount',
) {
	return wordRankDefinitions
		.map((rank, index) => {
			const nextRank = wordRankDefinitions[index + 1];
			const normalizedCorrectCount = `COALESCE(${correctCountExpression}, 0)`;
			const condition =
				nextRank ?
					`${normalizedCorrectCount} >= ${rank.minCorrectCount} AND ${normalizedCorrectCount} < ${nextRank.minCorrectCount}`
				:	`${normalizedCorrectCount} >= ${rank.minCorrectCount}`;

			return `SUM(CASE WHEN ${condition} THEN 1 ELSE 0 END) AS ${rank.key}`;
		})
		.join(',\n\t\t\t');
}
