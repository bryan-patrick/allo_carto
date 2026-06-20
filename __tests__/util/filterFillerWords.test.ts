import filterFillerWords from '@/src/util/filterFillerWords';

jest.mock('@/src/util/shuffleArray', () =>
	jest.fn((words: string[]) => [...words]),
);

describe('filterFillerWords', () => {
	test('returns each mapped choice only once', () => {
		const choices = filterFillerWords({
			amount: 6,
			words: ['happy', 'small', 'happy', 'tall', 'small'],
			correctWords: ['fast'],
		});

		expect(choices).toEqual(['happy', 'small', 'tall', 'fast']);
	});

	test('deduplicates without regard to capitalization', () => {
		const choices = filterFillerWords({
			amount: 6,
			words: ['Sorry', 'sorry', 'hello'],
			correctWords: ['HELLO', 'hello'],
		});

		expect(choices).toEqual(['Sorry', 'HELLO']);
	});
});
