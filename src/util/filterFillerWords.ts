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
	 * Normalize caps
	 */
	let lowerCaseCorrectWords = correctWords.map((word: string) =>
		word.toLowerCase(),
	);

	/**
	 * Remove the correct answer from this choices arr
	 * (also shuffle and slice to amount)
	 */
	let wordsCopy = [...shuffleArray(words)]
		.filter(word => !lowerCaseCorrectWords.includes(word.toLowerCase()))
		.slice(0, amount);

	return shuffleArray([
		...wordsCopy.filter(article => article !== 'DELETE'),
		...correctWords,
	]);
}
