import {
	getWordProgressDefinitionFromCorrectCount,
	getWordProgressKeyFromCounts,
	getWordProgressSqlCountSelect,
} from '@/src/util/wordProgress';

describe('wordProgress', () => {
	test.each([
		[{ correctCount: 0, seenCount: 0 }, 'unseen'],
		[{ correctCount: 0, seenCount: 1 }, 'new'],
		[{ correctCount: 2, seenCount: 1 }, 'new'],
		[{ correctCount: 3, seenCount: 1 }, 'learning'],
		[{ correctCount: 6, seenCount: 1 }, 'learning'],
		[{ correctCount: 7, seenCount: 1 }, 'familiar'],
		[{ correctCount: 11, seenCount: 1 }, 'familiar'],
		[{ correctCount: 12, seenCount: 1 }, 'known'],
		[{ correctCount: 14, seenCount: 1 }, 'known'],
		[{ correctCount: 15, seenCount: 1 }, 'mastered'],
	])('derives $1 progress from counts', (counts, expectedProgress) => {
		expect(getWordProgressKeyFromCounts(counts)).toBe(expectedProgress);
	});

	test('treats a score without seen data as visible progress', () => {
		expect(getWordProgressDefinitionFromCorrectCount(0).key).toBe('new');
		expect(getWordProgressDefinitionFromCorrectCount(-1).key).toBe('new');
	});

	test('builds a SQL count for every progress key', () => {
		const select = getWordProgressSqlCountSelect();

		for (const key of ['unseen', 'new', 'learning', 'familiar', 'known', 'mastered']) {
			expect(select).toContain(`AS ${key}`);
		}
	});
});
