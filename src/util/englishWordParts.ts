/**
 * Typing
 */
export type CanonicalEnglish = string | string[];

export interface EnglishPrefixDefinition {
	englishPrefixes?: string[] | null;
	englishArticle?: string | null;
}

export interface EnglishWordDefinition extends EnglishPrefixDefinition {
	englishWords: string[];
	canonicalEnglish?: CanonicalEnglish | null;
}

/**
 * A list of possible prefixes (so far).
 *
 * TODO: This includes articles and prepositions purposefully.
 * It takes precedence over articles. Article slots are meant to
 * be deprecated/replaced by prefixes but I haven't removed the
 * articles feature yet.
 */

export const defaultEnglishPrefixChoices = [
	'the',
	'a',
	'an',
	'to',
	'of',
	'from',
	'for',
	'in',
	'on',
	'at',
	'with',
	'by',
];

/**
 * Read the optional list of English prefixes saved with a word.
 */
export function parseEnglishPrefixes(savedPrefixes?: string | null): string[] | undefined {
	if (!savedPrefixes) {
		return undefined;
	}

	return JSON.parse(savedPrefixes);
}

/**
 * Reads a word's saved canonical English answers.
 */
export function parseCanonicalEnglish(savedAnswers?: string | null): CanonicalEnglish | undefined {
	if (savedAnswers === undefined || savedAnswers === null) {
		return undefined;
	}

	return JSON.parse(savedAnswers);
}

/**
 * Lists the canonical English answers for a word or passage segment.
 */
export function getCanonicalEnglishAnswers(answers?: CanonicalEnglish | null): string[] {
	if (answers === undefined || answers === null) {
		return [];
	}

	if (Array.isArray(answers)) {
		return answers;
	}

	return [answers];
}

/**
 * Get the accepted answers for the first slot on a flashcard.
 * Or the article.
 */
export function getEnglishPrefixes(word: EnglishPrefixDefinition): string[] {
	if (word.englishPrefixes) {
		return word.englishPrefixes;
	}

	if (word.englishArticle) {
		return [word.englishArticle];
	}

	return [];
}

/**
 * Join each accepted prefixes with the word meanings.
 */
export function getEnglishTranslations(word: EnglishWordDefinition): string[] {
	const prefixes = getEnglishPrefixes(word);
	const translations: string[] = [];

	if (prefixes.length === 0) {
		return word.englishWords;
	}

	for (const prefix of prefixes) {
		for (const meaning of word.englishWords) {
			translations.push(`${prefix} ${meaning}`);
		}
	}

	return translations;
}

/**
 * Picks the canonical English answer for a flashcard, falling back to its first meaning.
 */
export function getEnglishFlashcardAnswers(word: EnglishWordDefinition): string[] {
	const canonicalAnswers = getCanonicalEnglishAnswers(word.canonicalEnglish);
	const meaning = canonicalAnswers[0] ?? word.englishWords[0];

	if (meaning === undefined) {
		return [];
	}

	return [meaning];
}

/**
 * Lists a puzzle card's canonical English answers, falling back to its first meaning.
 */
export function getEnglishPuzzleAnswers(word: EnglishWordDefinition): string[] {
	const canonicalAnswers = getCanonicalEnglishAnswers(word.canonicalEnglish);
	let meaning = word.englishWords[0];

	if (canonicalAnswers.length > 0) {
		return canonicalAnswers;
	}

	if (word.englishPrefixes) {
		meaning = getEnglishTranslations(word)[0];
	}

	if (meaning === undefined) {
		return [];
	}

	return [meaning];
}
