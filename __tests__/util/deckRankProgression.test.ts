import {
	getDeckRankProgress,
	getDeckRankUnlockCount,
} from '@/src/util/deckRankProgression';
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
	it('rounds the halfway unlock threshold up', () => {
		expect(getDeckRankUnlockCount(0)).toBe(0);
		expect(getDeckRankUnlockCount(50)).toBe(25);
		expect(getDeckRankUnlockCount(51)).toBe(26);
	});

	it('starts New as available and keeps later ranks locked', () => {
		const rankCounts = makeRankCounts({ fnew: deckWordCount });

		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'fnew',
		})).toMatchObject({
			completion: 'incomplete',
			isSelectable: true,
			isUnlocked: true,
		});
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'bronze',
		})).toMatchObject({
			completion: 'incomplete',
			isSelectable: false,
			isUnlocked: false,
		});
	});

	it('softly completes a rank at halfway and keeps it playable', () => {
		const rankCounts = makeRankCounts({ fnew: 25, bronze: 25 });

		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'fnew',
		})).toMatchObject({
			completion: 'soft',
			isSelectable: true,
			isUnlocked: true,
			progressCount: 25,
			unlockCount: 25,
		});
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'bronze',
		})).toMatchObject({
			completion: 'incomplete',
			isSelectable: true,
			isUnlocked: true,
		});
	});

	it('allows multiple unlocked ranks while locking the next threshold', () => {
		const rankCounts = makeRankCounts({
			fnew: 10,
			bronze: 20,
			silver: 20,
		});

		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'fnew',
		}).completion).toBe('soft');
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'bronze',
		})).toMatchObject({ isSelectable: true, isUnlocked: true });
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'silver',
		})).toMatchObject({ isSelectable: false, isUnlocked: false });
	});

	it('distinguishes full completion from soft completion', () => {
		const rankCounts = makeRankCounts({ silver: deckWordCount });

		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'fnew',
		})).toMatchObject({ completion: 'full', isSelectable: false });
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'bronze',
		})).toMatchObject({ completion: 'full', isSelectable: false });
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'silver',
		})).toMatchObject({ completion: 'incomplete', isSelectable: true });
	});

	it('does not select an unlocked rank until it contains cards', () => {
		const rankCounts = makeRankCounts({ fnew: 25, silver: 25 });

		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts,
			rankKey: 'bronze',
		})).toMatchObject({
			completion: 'soft',
			isSelectable: false,
			isUnlocked: true,
		});
	});

	it('softly and fully completes Diamond using cards at Diamond', () => {
		const softCounts = makeRankCounts({ gold: 25, diamond: 25 });
		const fullCounts = makeRankCounts({ diamond: deckWordCount });

		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts: softCounts,
			rankKey: 'diamond',
		})).toMatchObject({
			completion: 'soft',
			isSelectable: true,
			isUnlocked: true,
		});
		expect(getDeckRankProgress({
			deckWordCount,
			rankCounts: fullCounts,
			rankKey: 'diamond',
		})).toMatchObject({
			completion: 'full',
			isSelectable: true,
			isUnlocked: true,
		});
	});
});
