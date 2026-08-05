import {
	getWordRankDefinitionFromCorrectCount,
	getWordRankKeyFromCounts,
	getWordRankSqlCountSelect,
} from '@/src/util/wordRanks';

describe('word rank helpers', () => {
	it.each([
		[-1, 'fnew'],
		[0, 'fnew'],
		[2, 'fnew'],
		[3, 'bronze'],
		[6, 'bronze'],
		[7, 'silver'],
		[11, 'silver'],
		[12, 'gold'],
		[14, 'gold'],
		[15, 'diamond'],
		[24, 'diamond'],
		[25, 'diamond'],
	])('maps score %i to %s', (score, expectedRank) => {
		expect(getWordRankDefinitionFromCorrectCount(score).key).toBe(expectedRank);
	});

	it('distinguishes Unseen from New using the stored counts', () => {
		expect(getWordRankKeyFromCounts({
			correctCount: 0,
			seenCount: 0,
		})).toBe('unseen');
		expect(getWordRankKeyFromCounts({
			correctCount: 0,
			seenCount: 1,
		})).toBe('fnew');
		expect(getWordRankKeyFromCounts({
			correctCount: 1,
			seenCount: 0,
		})).toBe('fnew');
	});

	it('builds separate SQL counts for Unseen and New', () => {
		const rankCountSelect = getWordRankSqlCountSelect(
			'uw.correctCount',
			'uw.seenCount',
		);

		expect(rankCountSelect).toContain(
			'COALESCE(uw.correctCount, 0) = 0 AND COALESCE(uw.seenCount, 0) = 0',
		);
		expect(rankCountSelect).toContain(
			'(COALESCE(uw.correctCount, 0) > 0 OR COALESCE(uw.seenCount, 0) > 0)',
		);
		expect(rankCountSelect).toContain(
			'COALESCE(uw.correctCount, 0) >= 15'
		);
	});
});
