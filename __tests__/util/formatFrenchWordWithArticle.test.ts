import formatFrenchWordWithArticle from '@/src/util/formatFrenchWordWithArticle';

describe('formatFrenchWordWithArticle', () => {
	test('joins regular articles with a space', () => {
		expect(formatFrenchWordWithArticle({ article: 'le', word: 'trajet' })).toBe(
			'le trajet',
		);
	});

	test('joins elided articles without a space', () => {
		expect(formatFrenchWordWithArticle({ article: "l'", word: 'ombre' })).toBe(
			"l'ombre",
		);
	});

	test('returns the word when there is no article', () => {
		expect(formatFrenchWordWithArticle({ word: 'bonjour' })).toBe('bonjour');
	});
});
