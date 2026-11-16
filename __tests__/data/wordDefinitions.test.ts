import { seedWords } from '@/data/french/words';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { getEnglishPrefixes, getEnglishPuzzleAnswers } from '@/src/util/englishWordParts';

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

/**
 * Checks whether a word meaning repeats a prefix already shown in its own answer slot.
 */
function hasDuplicatedEnglishPrefix(word: Word): boolean {
	const prefixes = getEnglishPrefixes(word);

	for (const prefix of prefixes) {
		if (word.englishWords.some(meaning => startsWithArticle(meaning, prefix))) {
			return true;
		}
	}

	return false;
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

	test('do not duplicate separately stored English prefixes in word meanings', () => {
		const wordsWithEmbeddedArticles = seedWords
			.filter(hasDuplicatedEnglishPrefix)
			.map(word => word.id);

		expect(wordsWithEmbeddedArticles).toEqual([]);
	});

	test('provide a usable English answer for each infinitive', () => {
		const malformedInfinitives = seedWords
			.filter(word => word.form === 'infinitive')
			.filter(word => {
				const answers = getEnglishPuzzleAnswers(word);

				return answers.length === 0 || answers.some(answer => answer.trim() === '');
			})
			.map(word => word.id);

		expect(malformedInfinitives).toEqual([]);
	});
});
