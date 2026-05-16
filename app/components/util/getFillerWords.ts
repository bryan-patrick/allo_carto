import filterFillerWords from './filterFillerWords';

interface GetFillerWordsProps {
	language?: 'french' | 'english';
	amount?: number;
	cefrLevel?: string;
	correctWord: string;
}

function sleep(ms: number) {
	return new Promise(_ => setTimeout(_, ms));
}

/**
 * TODO refactor mock once DB is up
 *
 * This function gets filler words for the
 * user to select from when doing flash cards
 */
export default async function getEnglishWords({
	language = 'english',
	cefrLevel = 'A1',
	amount = 4,
	correctWord,
}: GetFillerWordsProps) {
	const mockWords = [
		'bonjour',
		'merci',
		'oui',
		'non',
		'eau',
		'pain',
		'maison',
		'travail',
		'ami',
		'manger',
	];

	await sleep(500);

	return filterFillerWords({ amount, correctWord });
}
