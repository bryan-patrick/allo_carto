import { getDeckCompletionPercent } from '@/src/util/deckCompletion';

/**
 * Typing
 */
interface TestRankCounts {
	fnew: number;
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
		fnew: 0,
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

	it('gives a New word half a point', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 80,
				rankCounts: makeRankCounts({
					fnew: 36,
				}),
			}),
		).toBe(5.625);
	});

	it("uses each word's current rank points", () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 10,
				rankCounts: makeRankCounts({
					fnew: 5,
					diamond: 5,
				}),
			}),
		).toBe(56.25);
	});

	it('reaches 12.5% when every word is New', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 10,
				rankCounts: makeRankCounts({ fnew: 10 }),
			}),
		).toBe(12.5);
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
