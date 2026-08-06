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

	/**
	 * English answer articles also have their own selection slot,
	 * so translations must not contain the same article again.
	 */
	test('do not duplicate English articles inside englishWords', () => {
		const wordsWithDuplicatedArticles = seedWords
			.filter(word => word.englishArticle)
			.flatMap(word =>
				word.englishWords
					.filter(englishWord => startsWithArticle(englishWord, word.englishArticle as string))
					.map(() => word.id),
			);

		expect(wordsWithDuplicatedArticles).toEqual([]);
	});
});
