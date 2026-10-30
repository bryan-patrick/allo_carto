import type { SolveSentence, SolveSentenceKeyword } from '@/src/components/Solve/solveTypes';
import {
	checkSolveAnswer,
	normalizeFrenchSolveAnswer,
	normalizeSolveAnswer,
	type SolveAnswerResult,
} from './solveAnswer';

export interface CheckSentenceAnswerOptions {
	answer: string;
	sentence: SolveSentence;
}

const optionalSentenceWords = new Set([
	'a',
	'an',
	'the',
	'some',
	'about',
	'above',
	'across',
	'after',
	'against',
	'along',
	'alongside',
	'among',
	'around',
	'as',
	'at',
	'before',
	'behind',
	'below',
	'beneath',
	'beside',
	'besides',
	'between',
	'beyond',
	'by',
	'despite',
	'down',
	'during',
	'except',
	'for',
	'from',
	'in',
	'inside',
	'into',
	'like',
	'near',
	'of',
	'off',
	'on',
	'onto',
	'out',
	'outside',
	'over',
	'past',
	'since',
	'through',
	'throughout',
	'to',
	'toward',
	'towards',
	'under',
	'underneath',
	'until',
	'up',
	'upon',
	'via',
	'with',
	'within',
	'without',
]);

const optionalFrenchSentenceWords = new Set([
	'le',
	'la',
	'les',
	'un',
	'une',
	'des',
	'du',
	'au',
	'aux',
	'à',
	'après',
	'avant',
	'avec',
	'chez',
	'contre',
	'dans',
	'de',
	'depuis',
	'derrière',
	'dès',
	'devant',
	'durant',
	'en',
	'entre',
	'envers',
	'hors',
	'malgré',
	'par',
	'parmi',
	'pendant',
	'pour',
	'sans',
	'selon',
	'sous',
	'sur',
	'vers',
]);

/*
 * Keep the French keywords in order while leaving accents unchanged.
 */
function getFrenchSentenceKeywords(text: string): string[] {
	const compatibleText = text.normalize('NFKC');
	const lowerCaseText = compatibleText.toLowerCase();
	const plainApostrophes = lowerCaseText.replace(/[’‘ʼ]/gu, "'");
	const withoutShortArticles = plainApostrophes.replace(/\b[ld]'(?=[\p{L}\p{M}])/gu, '');
	const normalizedText = normalizeFrenchSolveAnswer(withoutShortArticles);
	const words = normalizedText.split(' ');

	return words.filter(word => word.length > 0 && !optionalFrenchSentenceWords.has(word));
}

/*
 * Check the French sentence's spelling, accents, and keyword order against its saved wording.
 */
export function checkFrenchSentenceAnswer({
	answer,
	sentence,
}: CheckSentenceAnswerOptions): SolveAnswerResult {
	const normalizedAnswer = normalizeFrenchSolveAnswer(answer);
	const answerWords = getFrenchSentenceKeywords(answer);
	let matches = false;

	if (!normalizedAnswer) {
		return {
			status: 'empty',
			acceptedAnswer: null,
		};
	}

	for (const frenchAnswer of sentence.frenchAnswers) {
		const expectedWords = getFrenchSentenceKeywords(frenchAnswer);

		matches = expectedWords.length > 0 && answerWords.length === expectedWords.length;

		if (matches) {
			matches = answerWords.every((word, index) => word === expectedWords[index]);
		}

		if (matches) {
			break;
		}
	}

	return {
		status: matches ? 'exact' : 'incorrect',
		acceptedAnswer: matches ? answer.trim() : null,
	};
}

const englishContractions: Record<string, string> = {
	"can't": 'can not',
	cannot: 'can not',
	"won't": 'will not',
	"don't": 'do not',
	"doesn't": 'does not',
	"didn't": 'did not',
	"isn't": 'is not',
	"aren't": 'are not',
	"wasn't": 'was not',
	"weren't": 'were not',
	"hasn't": 'has not',
	"haven't": 'have not',
	"hadn't": 'had not',
	"couldn't": 'could not',
	"wouldn't": 'would not',
	"shouldn't": 'should not',
	"mustn't": 'must not',
	"it's": 'it is',
	"he's": 'he is',
	"she's": 'she is',
	"that's": 'that is',
	"there's": 'there is',
	"here's": 'here is',
	"what's": 'what is',
	"who's": 'who is',
	"i'm": 'i am',
	"you're": 'you are',
	"we're": 'we are',
	"they're": 'they are',
	"i've": 'i have',
	"you've": 'you have',
	"we've": 'we have',
	"they've": 'they have',
	"i'll": 'i will',
	"you'll": 'you will',
	"he'll": 'he will',
	"she'll": 'she will',
	"we'll": 'we will',
	"they'll": 'they will',
};

/*
 * Keeps English keywords while allowing articles and prepositions to move or be left out.
 */
export function getSentenceKeywords(text: string): string[] {
	const compatibleText = text.normalize('NFKC');
	const lowerCaseText = compatibleText.toLowerCase();
	const plainApostrophes = lowerCaseText.replace(/[’‘ʼ]/gu, "'");
	const expandedText = plainApostrophes.replace(/\b[\p{L}]+(?:'[\p{L}]+)?\b/gu, word => {
		const expandedWord = englishContractions[word];

		return typeof expandedWord === 'string' ? expandedWord : word;
	});
	const withoutPrepositionPhrases = expandedText.replace(
		/\b(?:in front of|on top of|next to|out of|up to|because of|due to|according to|instead of|close to|away from)\b/gu,
		' ',
	);
	const normalizedText = normalizeSolveAnswer(withoutPrepositionPhrases);
	const separateAccents = normalizedText.normalize('NFD');
	const plainLetters = separateAccents.replace(/\p{M}/gu, '');
	const words = plainLetters.split(' ');

	return words.filter(word => word.length > 0 && !optionalSentenceWords.has(word));
}

/*
 * Match every required keyword in order. They HAVE to at least be in order.
 */
function matchesSentenceKeywords(answerWords: string[], keywords: SolveSentenceKeyword[]): boolean {
	let matchedPositions = new Set([0]);

	if (keywords.length === 0) {
		return false;
	}

	for (const keyword of keywords) {
		const nextPositions = new Set<number>();

		for (const answerPosition of matchedPositions) {
			for (const englishMeaning of keyword.englishWords) {
				const expectedWords = getSentenceKeywords(englishMeaning);
				const endPosition = answerPosition + expectedWords.length;
				let matches = expectedWords.length > 0 && endPosition <= answerWords.length;

				for (let index = 0; matches && index < expectedWords.length; index++) {
					const wordResult = checkSolveAnswer({
						answer: answerWords[answerPosition + index],
						englishWords: [expectedWords[index]],
					});

					matches = wordResult.status === 'exact' || wordResult.status === 'close';
				}

				if (matches) {
					nextPositions.add(endPosition);
				}
			}
		}

		matchedPositions = nextPositions;

		if (matchedPositions.size === 0) {
			break;
		}
	}

	return matchedPositions.has(answerWords.length);
}

/*
 * Check the English keywords against the card meanings or existing English passage text.
 */
export function checkSentenceAnswer({
	answer,
	sentence,
}: CheckSentenceAnswerOptions): SolveAnswerResult {
	const normalizedAnswer = normalizeSolveAnswer(answer);
	const answerWords = getSentenceKeywords(answer);
	const acceptedKeywordOrders = [sentence.keywords];
	let matches = false;

	if (!normalizedAnswer) {
		return {
			status: 'empty',
			acceptedAnswer: null,
		};
	}

	if (sentence.englishText) {
		acceptedKeywordOrders.push([
			{
				englishWords: [sentence.englishText],
			},
		]);
	}

	for (const keywords of acceptedKeywordOrders) {
		matches = matchesSentenceKeywords(answerWords, keywords);

		if (matches) {
			break;
		}
	}

	return {
		status: matches ? 'exact' : 'incorrect',
		acceptedAnswer: matches ? answer.trim() : null,
	};
}
