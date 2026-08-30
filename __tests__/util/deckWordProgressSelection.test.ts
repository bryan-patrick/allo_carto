import { getDeckWordProgressSelectionWeight } from '@/src/util/deckWordProgressSelection';

describe('deckWordProgressSelection', () => {
	test.each([
		[{ correctCount: 0, seenCount: 0 }, 1.5],
		[{ correctCount: 0, seenCount: 1 }, 1.3],
		[{ correctCount: 3, seenCount: 1 }, 1.15],
		[{ correctCount: 7, seenCount: 1 }, 1.05],
		[{ correctCount: 12, seenCount: 1 }, 1],
		[{ correctCount: 15, seenCount: 1 }, 0.9],
	])('preserves the selection weight for $1', (counts, expectedWeight) => {
		expect(getDeckWordProgressSelectionWeight(counts)).toBe(expectedWeight);
	});
});
