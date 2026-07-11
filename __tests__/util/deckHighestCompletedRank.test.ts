import {
	doesCompletedRankMeetRequirement,
	getHighestCompletedDeckRank,
} from '@/src/util/deckRankProgression';
import type { WordRankKey } from '@/src/util/wordRanks';

type RankCounts = Record<WordRankKey, number>;

function makeRankCounts(overrides: Partial<RankCounts> = {}): RankCounts {
	return {
		fnew: 0,
		bronze: 0,
		silver: 0,
		gold: 0,
		diamond: 0,
		...overrides,
	};
}

const completedRankCases: [ WordRankKey, RankCounts ][] = [
	['fnew', makeRankCounts({ bronze: 2, silver: 1 })],
	['bronze', makeRankCounts({ silver: 2, gold: 1 })],
	['silver', makeRankCounts({ gold: 2, diamond: 1 })],
	['gold', makeRankCounts({ diamond: 3 })],
];

describe('highest completed deck rank', () => {
	it('returns null when the deck is empty or still has New cards', () => {
		expect(
			getHighestCompletedDeckRank(makeRankCounts()),
		).toBeNull();
		expect(
			getHighestCompletedDeckRank(makeRankCounts({ fnew: 1, bronze: 2 })),
		).toBeNull();
	});

	it.each(completedRankCases)('returns %s as the highest completed rank', (rank, rankCounts) => {
		expect(getHighestCompletedDeckRank(rankCounts)).toBe(rank);
	});

	it('compares completed ranks with deck requirements', () => {
		expect(
			doesCompletedRankMeetRequirement({
				completedRank: null,
				requiredRank: null,
			}),
		).toBe(true);
		expect(
			doesCompletedRankMeetRequirement({
				completedRank: 'silver',
				requiredRank: 'bronze',
			}),
		).toBe(true);
		expect(
			doesCompletedRankMeetRequirement({
				completedRank: 'fnew',
				requiredRank: 'bronze',
			}),
		).toBe(false);
		expect(
			doesCompletedRankMeetRequirement({
				completedRank: null,
				requiredRank: 'fnew',
			}),
		).toBe(false);
	});
});
