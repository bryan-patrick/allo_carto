import shuffleArray from './shuffleArray';

export const frenchArticles = ['le', 'la', "l\'", 'les', 'un', 'une', 'des'];
export const englishArticles = ['the', 'a', 'an'];

/**
 * Typing
 */
interface FilterFillerWordsProps {
	amount: number;
	words?: string[];
	correctWords: string[];
}

function getUniqueWords(words: string[]) {
	const uniqueWords = new Map<string, string>();

	for (const word of words) {
		const normalizedWord = word.toLowerCase();

		if (!uniqueWords.has(normalizedWord)) {
			uniqueWords.set(normalizedWord, word);
		}
	}

	return [...uniqueWords.values()];
}

/**
 * This is a helper function for
 * use with the buttons on flashcards.
 *
 * It returns a shuffled array of words that
 * includes the correct word.
 */
export default function filterFillerWords({
	amount,
	words = englishArticles,
	correctWords,
}: FilterFillerWordsProps) {
	/**
	 * Different French words can have the same English
	 * translations so we remove the duplicates.
	 */
	const uniqueWords = getUniqueWords(words);
	const uniqueCorrectWords = getUniqueWords(correctWords);
	const normalizedCorrectWords = new Set(
		uniqueCorrectWords.map(word => word.toLowerCase()),
	);

	/**
	 * Remove the correct answer from this choices arr
	 * (also shuffle and slice to amount)
	 */
	const wordsCopy = [...shuffleArray(uniqueWords)]
		.filter(word => !normalizedCorrectWords.has(word.toLowerCase()))
		.slice(0, amount);

	return shuffleArray([
		...wordsCopy.filter(article => article !== 'DELETE'),
		...uniqueCorrectWords,
	]);
}
