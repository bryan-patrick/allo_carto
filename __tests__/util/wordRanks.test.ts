import {
	getWordRankDefinition,
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
		[25, 'memorized'],
	])('maps score %i to %s', (score, expectedRank) => {
		expect(getWordRankDefinition(score).key).toBe(expectedRank);
	});

	it('builds SQL count columns from the shared thresholds', () => {
		expect(getWordRankSqlCountSelect('uw.correctCount')).toContain(
			'COALESCE(uw.correctCount, 0) >= 15 AND COALESCE(uw.correctCount, 0) < 25'
		);
		expect(getWordRankSqlCountSelect('uw.correctCount')).toContain(
			'COALESCE(uw.correctCount, 0) >= 25'
		);
	});
});
