import { getDeckCompletionPercent } from '@/src/util/deckCompletion';

describe('getDeckCompletionPercent', () => {
	test('returns a floored integer percentage', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 3,
				wordProgressCounts: {
					new: 1,
					learning: 1,
					familiar: 0,
					known: 0,
					mastered: 0,
				},
			}),
		).toBe(12);
	});

	test('clamps the percentage to the valid display range', () => {
		expect(
			getDeckCompletionPercent({
				deckWordCount: 1,
				wordProgressCounts: {
					new: 0,
					learning: 0,
					familiar: 0,
					known: 0,
					mastered: 2,
				},
			}),
		).toBe(100);

		expect(
			getDeckCompletionPercent({
				deckWordCount: 1,
				wordProgressCounts: {
					new: -1,
					learning: 0,
					familiar: 0,
					known: 0,
					mastered: 0,
				},
			}),
		).toBe(0);
	});
});
