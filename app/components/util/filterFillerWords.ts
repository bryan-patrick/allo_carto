export const articles = ['le', 'la', "l\'", 'les', 'un', 'une', 'des'];

interface FilterFillerWordsProps {
	amount: number;
	words?: string[];
	correctWord: string;
}

export default function filterFillerWords({
	amount,
	words = articles,
	correctWord,
}: FilterFillerWordsProps) {
	let wordsCopy = [...words].filter(word => !(word === correctWord));

	if (amount <= wordsCopy.length) {
		let iterationCount = wordsCopy.length - amount + 1;
		let max = 50;
		let safety = 0;

		while (iterationCount > 0 && safety < max) {
			let randomPos = Math.floor(Math.random() * wordsCopy.length);
			safety += 1;

			if (safety >= max) {
				throw new Error('Maximum iterations allowed (getFillerWords.ts)');
			}

			if (wordsCopy[randomPos] !== 'DELETE') {
				wordsCopy[randomPos] = 'DELETE';
				iterationCount -= 1;
			}
		}
	}

	return [...wordsCopy.filter(article => article !== 'DELETE'), correctWord];
}
