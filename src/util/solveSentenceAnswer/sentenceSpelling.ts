/**
 * French words that include a preposition, such as au for à + le.
 */
const frenchPrepositionForms: Record<string, string> = {
	au: 'a',
	aux: 'a',
	du: 'de',
	des: 'de',
	d: 'de',
};

/**
 * Makes words easier to compare by ignoring capitals, accents, and punctuation.
 */
export function normalizeSentenceSpelling(text: string): string {
	let result = text;

	result = result.normalize('NFKD');
	result = result.replace(/\p{M}/gu, '');
	result = result.toLowerCase();

	/**
	 * Accept ordinary keyboard spellings such as coeur for cœur.
	 */
	result = result.replace(/œ/gu, 'oe');
	result = result.replace(/æ/gu, 'ae');
	result = result.replace(/[^\p{L}\p{N}]/gu, '');

	return result;
}

/**
 * Keeps the preposition in words like au and du
 * when the player leaves out the article.
 */
export function getFrenchSentencePreposition(text: string): string {
	const spelling = normalizeSentenceSpelling(text);
	const preposition = frenchPrepositionForms[spelling];
	let result = text;

	if (typeof preposition === 'string') {
		result = preposition;
	}

	return result;
}
