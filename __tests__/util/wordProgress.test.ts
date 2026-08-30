import {
	getWordProgressDefinition,
	getWordProgressKeyFromCounts,
	getWordProgressSqlCountSelect,
	wordProgressDefinitions,
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

	test('defines unseen as a full progress rank', () => {
		const unseen = getWordProgressDefinition({ correctCount: 0, seenCount: 0 });

		expect(unseen).toEqual({
			key: 'unseen',
			name: 'Unseen',
			minCorrectCount: 0,
			iconName: 'question-mark',
		});
		expect(wordProgressDefinitions[0]).toEqual(unseen);
	});

	test('distinguishes unseen from a new word with the same score', () => {
		expect(getWordProgressDefinition({ correctCount: 0, seenCount: 0 }).key).toBe('unseen');
		expect(getWordProgressDefinition({ correctCount: 0, seenCount: 1 }).key).toBe('new');
	});

	test('builds a SQL count for every progress key', () => {
		const select = getWordProgressSqlCountSelect();

		for (const key of ['unseen', 'new', 'learning', 'familiar', 'known', 'mastered']) {
			expect(select).toContain(`AS ${key}`);
		}
	});
});
