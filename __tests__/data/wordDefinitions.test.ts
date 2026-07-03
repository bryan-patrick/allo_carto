import { seedWords } from '@/data/french/words';

function startsWithArticle(word: string, article: string) {
	const normalizedWord = word.toLowerCase();
	const normalizedArticle = article.toLowerCase();

	if (normalizedArticle.endsWith("'")) {
		return normalizedWord.startsWith(normalizedArticle);
	}

	return normalizedWord.startsWith(`${normalizedArticle} `);
}

describe('word definitions', () => {
	test('do not duplicate French articles inside frenchWord', () => {
		const wordsWithDuplicatedArticles = seedWords
			.filter(
				word =>
					word.frenchArticle &&
					startsWithArticle(word.frenchWord, word.frenchArticle),
			)
			.map(word => word.id);

		expect(wordsWithDuplicatedArticles).toEqual([]);
	});

	test('do not duplicate English articles inside englishWords', () => {
		const wordsWithDuplicatedArticles = seedWords
			.filter(word => word.englishArticle)
			.flatMap(word =>
				word.englishWords
					.filter(englishWord =>
						startsWithArticle(englishWord, word.englishArticle as string),
					)
					.map(() => word.id),
			);

		expect(wordsWithDuplicatedArticles).toEqual([]);
	});
});
