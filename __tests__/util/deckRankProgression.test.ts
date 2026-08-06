import { getDeckRankProgress } from '@/src/util/deckRankProgression';
import type { WordRankKey } from '@/src/util/wordRanks';

const deckWordCount = 50;

function makeRankCounts(
	overrides: Partial<Record<WordRankKey, number>>,
): Record<WordRankKey, number> {
	return {
		unseen: 0,
		fnew: 0,
		bronze: 0,
		silver: 0,
		gold: 0,
		diamond: 0,
		...overrides,
	};
}

describe('deck rank progression', () => {
	it('starts Unseen as available and keeps New locked', () => {
		const rankCounts = makeRankCounts({ unseen: deckWordCount });

		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'unseen',
			}),
		).toMatchObject({
			completion: 'incomplete',
			isSelectable: true,
			isUnlocked: true,
		});
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toMatchObject({
			completion: 'incomplete',
			isSelectable: false,
			isUnlocked: false,
		});
	});

	it('softly completes a rank at halfway and keeps it playable', () => {
		const rankCounts = makeRankCounts({ unseen: 25, fnew: 25 });

		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'unseen',
			}),
		).toMatchObject({
			completion: 'soft',
			isSelectable: true,
			isUnlocked: true,
			progressCount: 25,
			unlockCount: 25,
		});
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toMatchObject({
			completion: 'incomplete',
			isSelectable: true,
			isUnlocked: true,
		});
	});

	it('allows multiple unlocked ranks while locking the next threshold', () => {
		const rankCounts = makeRankCounts({
			unseen: 10,
			fnew: 20,
			bronze: 20,
		});

		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'unseen',
			}).completion,
		).toBe('soft');
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toMatchObject({ isSelectable: true, isUnlocked: true });
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'bronze',
			}),
		).toMatchObject({ isSelectable: false, isUnlocked: false });
	});

	it('distinguishes full completion from soft completion', () => {
		const rankCounts = makeRankCounts({ silver: deckWordCount });

		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'fnew',
			}),
		).toMatchObject({ completion: 'full', isSelectable: false });
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'bronze',
			}),
		).toMatchObject({ completion: 'full', isSelectable: false });
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'silver',
			}),
		).toMatchObject({ completion: 'incomplete', isSelectable: true });
	});

	it('does not select an unlocked rank until it contains cards', () => {
		const rankCounts = makeRankCounts({ fnew: 25, silver: 25 });

		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts,
				rankKey: 'bronze',
			}),
		).toMatchObject({
			completion: 'soft',
			isSelectable: false,
			isUnlocked: true,
		});
	});

	it('softly and fully completes Diamond using cards at Diamond', () => {
		const softCounts = makeRankCounts({ gold: 25, diamond: 25 });
		const fullCounts = makeRankCounts({ diamond: deckWordCount });

		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts: softCounts,
				rankKey: 'diamond',
			}),
		).toMatchObject({
			completion: 'soft',
			isSelectable: true,
			isUnlocked: true,
		});
		expect(
			getDeckRankProgress({
				deckWordCount,
				rankCounts: fullCounts,
				rankKey: 'diamond',
			}),
		).toMatchObject({
			completion: 'full',
			isSelectable: true,
			isUnlocked: true,
		});
	});
});
