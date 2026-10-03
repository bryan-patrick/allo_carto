import { getWordProgressKeyFromCounts } from '@/src/util/wordProgress';

describe('wordProgress', () => {
	test.each([
		[{ correctCount: 0, seenCount: 0 }, 'unseen'],
		[{ correctCount: 0, seenCount: 1 }, 'new'],
		[{ correctCount: 1, seenCount: 0 }, 'new'],
		[{ correctCount: 2, seenCount: 1 }, 'learning'],
		[{ correctCount: 4, seenCount: 1 }, 'learning'],
		[{ correctCount: 5, seenCount: 1 }, 'familiar'],
		[{ correctCount: 6, seenCount: 1 }, 'familiar'],
		[{ correctCount: 7, seenCount: 1 }, 'known'],
		[{ correctCount: 9, seenCount: 1 }, 'known'],
		[{ correctCount: 10, seenCount: 1 }, 'mastered'],
	])('classifies %j as %s', (counts, expectedProgress) => {
		expect(getWordProgressKeyFromCounts(counts)).toBe(expectedProgress);
	});
});
