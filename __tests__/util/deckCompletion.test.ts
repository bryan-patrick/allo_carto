import { getDeckCompletionPercent } from '@/src/util/deckCompletion';

/**
 * Typing
 */
interface TestRankCounts {
	seen: number;
	bronze: number;
	silver: number;
	gold: number;
	diamond: number;
}

/**
 * Test helpers
 */
function makeRankCounts(
	overrides: Partial<TestRankCounts> = {},
): TestRankCounts {
	return {
		seen: 0,
		bronze: 0,
		silver: 0,
		gold: 0,
		diamond: 0,
		...overrides,
	};
}

describe('deck completion', () => {
	it('returns 0 for an empty deck', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 0,
				rankCounts: makeRankCounts(),
			}),
		).toBe(0);
	});

	it('does not count merely seeing words as familiarity', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 80,
				rankCounts: makeRankCounts({
					seen: 36,
				}),
			}),
		).toBe(0);
	});

	it('uses rank mastery when it is higher than seen progress', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 10,
				rankCounts: makeRankCounts({
					seen: 10,
					diamond: 5,
				}),
			}),
		).toBe(50);
	});

	it('keeps full precision', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 3,
				rankCounts: makeRankCounts({ bronze: 1 }),
			}),
		).toBeCloseTo(100 / 12);
	});
});
