import { getDeckRankSelectionState } from '@/src/util/deckRankProgression';
import type { WordRankKey } from '@/src/util/wordRanks';

const deckWordCount = 50;

function makeRankCounts(
	overrides: Partial<Record<WordRankKey, number>>,
): Record<WordRankKey, number> {
	return {
		fnew: 0,
		bronze: 0,
		silver: 0,
		gold: 0,
		diamond: 0,
		...overrides,
	};
}

describe('deck rank progression', () => {
	it('keeps the earliest active rank available even below the old minimum', () => {
		const rankCounts = makeRankCounts({
			fnew: 4,
			bronze: deckWordCount - 4,
		});

		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toBe('available');
	});

	it('locks the next rank while the earliest active rank still has cards', () => {
		const rankCounts = makeRankCounts({
			fnew: 10,
			bronze: 20,
			silver: 20,
		});

		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toBe('available');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'bronze',
			}),
		).toBe('locked');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'silver',
			}),
		).toBe('locked');
	});

	it('unlocks the next rank after the earlier rank is complete', () => {
		const rankCounts = makeRankCounts({
			bronze: 15,
			silver: 20,
			gold: 15,
		});

		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toBe('complete');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'bronze',
			}),
		).toBe('available');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'silver',
			}),
		).toBe('locked');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'gold',
			}),
		).toBe('locked');
	});

	it('marks cleared ranks complete instead of locked', () => {
		const rankCounts = makeRankCounts({
			silver: deckWordCount,
		});

		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toBe('complete');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'bronze',
			}),
		).toBe('complete');
	});

	it('keeps unreached empty ranks locked', () => {
		const rankCounts = makeRankCounts({
			fnew: deckWordCount,
		});

		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts,
				rankKey: 'silver',
			}),
		).toBe('locked');
	});

	it('unlocks diamond only when every deck card is diamond', () => {
		const partialDiamondCounts = makeRankCounts({
			gold: 1,
			diamond: deckWordCount - 1,
		});
		const completeDiamondCounts = makeRankCounts({
			diamond: deckWordCount,
		});

		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts: partialDiamondCounts,
				rankKey: 'diamond',
			}),
		).toBe('locked');
		expect(
			getDeckRankSelectionState({
				deckWordCount,
				rankCounts: completeDiamondCounts,
				rankKey: 'diamond',
			}),
		).toBe('available');
	});
});
