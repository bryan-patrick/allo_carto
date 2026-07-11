import {
	doesCompletedRankMeetRequirement,
	getHighestFullyCompletedDeckRank,
	getHighestSoftCompletedDeckRank,
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

describe('deck completion ranks', () => {
	it('returns null before half the deck reaches Bronze', () => {
		expect(getHighestSoftCompletedDeckRank(makeRankCounts())).toBeNull();
		expect(
			getHighestSoftCompletedDeckRank(makeRankCounts({ fnew: 2, bronze: 1 })),
		).toBeNull();
	});

	it('counts cards at the required rank or higher', () => {
		expect(
			getHighestSoftCompletedDeckRank(makeRankCounts({ fnew: 2, bronze: 2 })),
		).toBe('bronze');
		expect(
			getHighestSoftCompletedDeckRank(makeRankCounts({ fnew: 1, silver: 2 })),
		).toBe('silver');
		expect(
			getHighestSoftCompletedDeckRank(makeRankCounts({ gold: 2, diamond: 2 })),
		).toBe('diamond');
	});

	it('meets a Bronze requirement when half the cards reach Bronze', () => {
		const completedRank = getHighestSoftCompletedDeckRank(
			makeRankCounts({ fnew: 25, bronze: 25 }),
		);

		expect(completedRank).toBe('bronze');
		expect(doesCompletedRankMeetRequirement({
			completedRank,
			requiredRank: 'bronze',
		})).toBe(true);
	});

	it('tracks full completion separately', () => {
		expect(
			getHighestFullyCompletedDeckRank(makeRankCounts({ bronze: 3 })),
		).toBe('fnew');
		expect(
			getHighestFullyCompletedDeckRank(makeRankCounts({ silver: 3 })),
		).toBe('bronze');
		expect(
			getHighestFullyCompletedDeckRank(makeRankCounts({ diamond: 3 })),
		).toBe('diamond');
	});

	it('uses soft completion for deck requirements', () => {
		expect(doesCompletedRankMeetRequirement({
			completedRank: null,
			requiredRank: null,
		})).toBe(true);
		expect(doesCompletedRankMeetRequirement({
			completedRank: 'silver',
			requiredRank: 'bronze',
		})).toBe(true);
		expect(doesCompletedRankMeetRequirement({
			completedRank: 'fnew',
			requiredRank: 'bronze',
		})).toBe(false);
		expect(doesCompletedRankMeetRequirement({
			completedRank: null,
			requiredRank: 'fnew',
		})).toBe(false);
	});
});
