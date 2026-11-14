import { getWordProgressKeyFromCounts, type WordProgressKey } from '@/src/util/wordProgress';

interface WordProgressCounts {
	correctCount: number;
	seenCount: number;
}

describe('wordProgress', () => {
	test.each<[number, number, WordProgressKey]>([
		[0, 0, 'unseen'],
		[0, 1, 'new'],
		[4, 0, 'new'],
		[5, 1, 'learning'],
		[14, 1, 'learning'],
		[15, 1, 'familiar'],
		[29, 1, 'familiar'],
		[30, 1, 'known'],
		[49, 1, 'known'],
		[50, 1, 'mastered'],
	])('classifies %i correct and %i seen as %s', (correctCount, seenCount, expectedProgress) => {
		const counts: WordProgressCounts = {
			correctCount,
			seenCount,
		};

		expect(getWordProgressKeyFromCounts(counts)).toBe(expectedProgress);
	});
});
