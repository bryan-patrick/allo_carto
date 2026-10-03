import { seedWords } from '@/data/french/words';

/**
 * Check whether an article stored in its own field was also
 * accidentally included at the beginning of the word text.
 * Elided articles join directly; other articles use a space.
 */
function startsWithArticle(word: string, article: string) {
	const normalizedWord = word.toLowerCase();
	const normalizedArticle = article.toLowerCase();

	if (normalizedArticle.endsWith("'")) {
		return normalizedWord.startsWith(normalizedArticle);
	}

	return normalizedWord.startsWith(`${normalizedArticle} `);
}

describe('word definitions', () => {
	test('use unique dictionary IDs', () => {
		expect(new Set(seedWords.map(word => word.id)).size).toBe(seedWords.length);
	});
	/**
	 * French articles are rendered separately by the card UI.
	 * Including one in frenchWord would display it twice.
	 */
	test('do not duplicate French articles inside frenchWord', () => {
		const wordsWithDuplicatedArticles = seedWords
			.filter(word => word.frenchArticle && startsWithArticle(word.frenchWord, word.frenchArticle))
			.map(word => word.id);

		expect(wordsWithDuplicatedArticles).toEqual([]);
	});

	test('keep leading English articles in the first answer slot', () => {
		const wordsWithEmbeddedArticles = seedWords.flatMap(word =>
			word.englishWords
				.filter(englishWord => /^(a|an|the)\s/i.test(englishWord))
				.map(() => word.id),
		);

		expect(wordsWithEmbeddedArticles).toEqual([]);
	});

	test('keep the English infinitive marker in the first answer slot', () => {
		const malformedInfinitives = seedWords
			.filter(word => word.form === 'infinitive')
			.filter(
				word =>
					word.englishArticle !== 'to' ||
					word.englishWords.some(englishWord => /^to\s/i.test(englishWord)),
			)
			.map(word => word.id);

		expect(malformedInfinitives).toEqual([]);
	});
});
