import type { SolveSentence } from '@/src/components/Solve/solveTypes';
import { checkSolveAnswer, type SolveAnswerResult } from './solveAnswer';

/*
 * Help the player see what they got right and what to fix after a sentence attempt.
 * Use the same word checks for accepting an answer and showing its feedback.
 */
export interface CheckSentenceAnswerOptions {
	answer: string;
	sentence: SolveSentence;
}

export type SentenceAnswerLanguage = 'english' | 'french';
export type SentenceAnswerWordStatus = 'correct' | 'incorrect' | 'neutral';

export interface SentenceAnswerWord {
	text: string;
	status: SentenceAnswerWordStatus;
}

export interface SentenceAnswerReview extends SolveAnswerResult {
	words: SentenceAnswerWord[];
	missingWordCount: number;
}

interface ReviewSentenceAnswerOptions extends CheckSentenceAnswerOptions {
	language: SentenceAnswerLanguage;
}

interface SentenceWordToken {
	text: string;
	partIndex: number;
	isOptional: boolean;
}

interface SentenceTokens {
	parts: SentenceAnswerWord[];
	words: SentenceWordToken[];
}

interface SentenceMatchKeyword {
	alternatives: string[][];
	isProperNoun: boolean;
}

interface SentenceMatch {
	// Fewer word mistakes means this is a better fit for the player's answer.
	cost: number;
	correctWordCount: number;
	missingWordCount: number;
	words: SentenceAnswerWordStatus[];
}

const optionalSentenceWords = new Set(['a', 'an', 'the', 'some']);
const optionalFrenchSentenceWords = new Set(['le', 'la', 'les', 'un', 'une', 'du', 'des', 'l']);
const frenchPrepositionForms: Record<string, string> = {
	au: 'a',
	aux: 'a',
	du: 'de',
	des: 'de',
	d: 'de',
};

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

const plainFrenchOptionalWords = new Set(
	Array.from(optionalFrenchSentenceWords, normalizeSentenceSpelling),
);
const plainEnglishContractions = new Map(
	Object.entries(englishContractions).map(([word, meaning]) => {
		const spelling = normalizeSentenceSpelling(word);
		const result = [spelling, meaning] as const;

		return result;
	}),
);

/*
 * Give the checker a plain version of a word, such as ete for été or coeur for cœur.
 * This lets the player use an ordinary keyboard without failing over accents or punctuation.
 */
function normalizeSentenceSpelling(text: string): string {
	let result = text;

	result = result.normalize('NFKD');
	result = result.replace(/\p{M}/gu, '');
	result = result.toLowerCase();
	result = result.replace(/œ/gu, 'oe');
	result = result.replace(/æ/gu, 'ae');
	result = result.replace(/[^\p{L}\p{N}]/gu, '');

	return result;
}

/*
 * Keep the à in au and the de in du when checking the answer.
 * Those prepositions still matter even when the player leaves out the article.
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

/*
 * Make a simpler version of the sentence to check, and keep the original text for the feedback.
 * That lets can't be checked as can not while the player still sees exactly what they typed.
 */
function getSentenceTokens(text: string, language: SentenceAnswerLanguage): SentenceTokens {
	const pieces =
		text.match(/[\p{L}\p{M}\p{N}]+(?:['’‘ʼ][\p{L}\p{M}\p{N}]+)*|[^\p{L}\p{M}\p{N}]+/gu) ?? [];
	const optionalWords = language === 'english' ? optionalSentenceWords : plainFrenchOptionalWords;
	const result: SentenceTokens = {
		parts: [],
		words: [],
	};

	for (const piece of pieces) {
		const hasShortArticle = language === 'french' && /^l['’‘ʼ]/iu.test(piece);
		const hasShortPreposition = language === 'french' && /^d['’‘ʼ]/iu.test(piece);
		const partIndex = result.parts.length + (hasShortPreposition ? 1 : 0);
		const wordText = hasShortArticle || hasShortPreposition ? piece.slice(2) : piece;
		const spelling = normalizeSentenceSpelling(wordText);
		const expandedText =
			language === 'english' ?
				(plainEnglishContractions.get(spelling) ?? spelling)
			:	getFrenchSentencePreposition(spelling);

		const expandedWords = expandedText.split(' ').filter(Boolean);

		if (hasShortPreposition) {
			// The d’ means de, so leaving it out should count as a missing preposition.
			result.words.push({
				text: 'de',
				partIndex: result.parts.length,
				isOptional: false,
			});
			result.parts.push({
				text: piece.slice(0, 2),
				status: 'neutral',
			});
		}

		result.parts.push({
			text: hasShortPreposition ? piece.slice(2) : piece,
			status: 'neutral',
		});

		for (const word of expandedWords) {
			result.words.push({
				text: word,
				partIndex,
				isOptional:
					optionalWords.has(word) ||
					(language === 'french' && (spelling === 'du' || spelling === 'des')),
			});
		}
	}

	return result;
}

/*
 * Pick out the English words the player needs to include in their translation.
 * Keep words like in and under, while letting them leave out articles like a and the.
 */
export function getSentenceKeywords(text: string): string[] {
	const tokens = getSentenceTokens(text, 'english');
	const result: string[] = [];

	for (const word of tokens.words) {
		if (!word.isOptional) {
			result.push(word.text);
		}
	}

	return result;
}

/*
 * Prepare the words we expect from one possible translation.
 * Keep a name like Allô Carto together so a misspelled name doesn't spoil the answer.
 */
function getTextKeywords(
	text: string,
	language: SentenceAnswerLanguage,
	properNouns: string[],
): SentenceMatchKeyword[] {
	const tokens = getSentenceTokens(text, language);
	const words: string[] = [];
	const names: string[][] = [];
	const result: SentenceMatchKeyword[] = [];

	for (const word of tokens.words) {
		if (!word.isOptional) {
			words.push(word.text);
		}
	}

	for (const name of properNouns) {
		const nameTokens = getSentenceTokens(name, language);
		const nameWords: string[] = [];

		for (const word of nameTokens.words) {
			if (!word.isOptional) {
				nameWords.push(word.text);
			}
		}

		if (nameWords.length > 0) {
			names.push(nameWords);
		}
	}

	// Try Léo Martin before Léo, so the whole name stays together.
	names.sort((first, second) => {
		const result = second.length - first.length;

		return result;
	});

	for (let position = 0; position < words.length; position++) {
		const name = names.find(candidate => {
			let result = true;

			for (let offset = 0; offset < candidate.length; offset++) {
				if (words[position + offset] !== candidate[offset]) {
					result = false;
					break;
				}
			}

			return result;
		});
		const expectedWords = name ?? [words[position]];
		const nextWord = words[position + 1];
		const nextIsName = names.some(candidate => {
			let result = true;

			for (let offset = 0; offset < candidate.length; offset++) {
				if (words[position + 1 + offset] !== candidate[offset]) {
					result = false;
					break;
				}
			}

			return result;
		});
		const canJoinDe =
			language === 'french' &&
			!name &&
			words[position] === 'de' &&
			nextWord &&
			/^[aeiouyh]/u.test(nextWord) &&
			!nextIsName;

		if (canJoinDe) {
			// Accept dhiver as well as d’hiver, so the apostrophe is not needed to pass.
			result.push({
				alternatives: [['de', nextWord], ['d' + nextWord]],
				isProperNoun: false,
			});
			position++;
			continue;
		}

		result.push({
			alternatives: [expectedWords],
			isProperNoun: Boolean(name),
		});
		position += expectedWords.length - 1;
	}

	return result;
}

/*
 * The same answer can line up with the expected words in more than one way.
 * Pick the closest fit so the feedback gives the player credit for what they got right.
 */
function getBetterMatch(
	current: SentenceMatch | undefined,
	candidate: SentenceMatch,
): SentenceMatch {
	let result = candidate;

	if (current) {
		result = current;

		if (candidate.cost < current.cost) {
			result = candidate;
		} else if (candidate.cost === current.cost) {
			if (candidate.correctWordCount > current.correctWordCount) {
				result = candidate;
			} else if (
				candidate.correctWordCount === current.correctWordCount &&
				candidate.missingWordCount < current.missingWordCount
			) {
				result = candidate;
			}
		}
	}

	return result;
}

/*
 * Check whether a typed word is close enough to accept.
 * Keep English sentence puzzles as forgiving about small typos as the word puzzles.
 */
function matchesSentenceWord(
	answer: string,
	expected: string,
	language: SentenceAnswerLanguage,
): boolean {
	let result = false;

	if (language === 'english') {
		const wordCheck = checkSolveAnswer({
			answer,
			englishWords: [expected],
		});

		result = wordCheck.status === 'exact' || wordCheck.status === 'close';
	} else if (answer === expected) {
		result = true;
	} else {
		// Someone may type lhiver instead of l’hiver. The extra l should not make it fail.
		result = answer === 'l' + expected;
	}

	return result;
}

/*
 * Work out which words the player got right, even when they added or forgot a word.
 * If they forget "under" in "the cat is under the table," "table" should still get credit.
 */
function matchSentenceKeywords(
	answerWords: SentenceWordToken[],
	keywords: SentenceMatchKeyword[],
	language: SentenceAnswerLanguage,
): SentenceMatch {
	let result: SentenceMatch = {
		cost: 0,
		correctWordCount: 0,
		missingWordCount: 0,
		words: [],
	};
	let matches: SentenceMatch[] = [result];

	// Allow extra words at the start without losing the correct words that come after them.
	for (const word of answerWords) {
		const previous = matches[matches.length - 1];
		const wordStatus: SentenceAnswerWordStatus = word.isOptional ? 'neutral' : 'incorrect';
		const unmatchedWord: SentenceMatch = {
			...previous,
			words: [...previous.words],
		};

		if (!word.isOptional) {
			unmatchedWord.cost++;
		}

		unmatchedWord.words.push(wordStatus);
		matches.push(unmatchedWord);
	}

	for (const keyword of keywords) {
		const nameWordCounts = keyword.alternatives.map(option => {
			const result = option.length;

			return result;
		});
		const longestName = Math.max(1, ...nameWordCounts);
		// Allocarto takes one word and Allô Carto takes two. Either can fill the name's place.
		const alternatives =
			keyword.isProperNoun ?
				Array.from(
					{
						length: longestName,
					},
					(_, position) => {
						const result = Array<string>(position + 1);

						result.fill('');

						return result;
					},
				)
			:	keyword.alternatives;
		const bestMatches: (SentenceMatch | undefined)[] = [];

		for (const alternative of alternatives) {
			let optionMatches = matches;

			for (const expectedWord of alternative) {
				const firstMatch = optionMatches[0];
				const firstMissingWord: SentenceMatch = {
					...firstMatch,
				};
				const nextMatches: SentenceMatch[] = [];

				// Allow for a forgotten word so the words the player did include can still get credit.
				firstMissingWord.cost++;
				firstMissingWord.missingWordCount++;
				nextMatches.push(firstMissingWord);

				for (let position = 1; position <= answerWords.length; position++) {
					const previousMatch = optionMatches[position - 1];
					const previousMissing = optionMatches[position];
					const previousExtra = nextMatches[position - 1];
					const isCorrect =
						keyword.isProperNoun ||
						matchesSentenceWord(answerWords[position - 1].text, expectedWord, language);
					const wordStatus: SentenceAnswerWordStatus =
						keyword.isProperNoun ? 'neutral'
						: isCorrect ? 'correct'
						: 'incorrect';
					const matchedWord: SentenceMatch = {
						cost: previousMatch.cost,
						correctWordCount: previousMatch.correctWordCount,
						missingWordCount: previousMatch.missingWordCount,
						words: [...previousMatch.words],
					};
					const missingWord: SentenceMatch = {
						...previousMissing,
					};
					const isOptionalWord = answerWords[position - 1].isOptional;
					const extraWordStatus: SentenceAnswerWordStatus =
						isOptionalWord ? 'neutral' : 'incorrect';
					const extraWord: SentenceMatch = {
						...previousExtra,
						words: [...previousExtra.words],
					};
					let bestWithoutExtra: SentenceMatch;

					/*
					 * A wrong word, a missing word, and an extra word affect the rest of the sentence differently.
					 * Try all three so one mistake doesn't turn every word after it red.
					 */
					if (!isCorrect) {
						matchedWord.cost++;
					}

					if (isCorrect && !keyword.isProperNoun) {
						matchedWord.correctWordCount++;
					}

					matchedWord.words.push(wordStatus);

					missingWord.cost++;
					missingWord.missingWordCount++;

					if (!isOptionalWord) {
						extraWord.cost++;
					}

					extraWord.words.push(extraWordStatus);
					bestWithoutExtra = getBetterMatch(matchedWord, missingWord);

					nextMatches.push(getBetterMatch(bestWithoutExtra, extraWord));
				}

				optionMatches = nextMatches;
			}

			for (let position = 0; position < optionMatches.length; position++) {
				bestMatches[position] = getBetterMatch(bestMatches[position], optionMatches[position]);
			}
		}

		// Keep what already matched so the next word can build on it.
		matches = bestMatches.map((match, position) => {
			const result = match ?? matches[position];

			return result;
		});
	}

	result = matches[answerWords.length];

	return result;
}

/*
 * Decide whether to accept the translation and explain the result word by word.
 * Even a wrong answer should help the player see what to keep and what to fix on their next try.
 */
export function reviewSentenceAnswer({
	answer,
	sentence,
	language,
}: ReviewSentenceAnswerOptions): SentenceAnswerReview {
	const tokens = getSentenceTokens(answer, language);
	const properNouns = sentence.properNouns ?? [];
	const acceptedOrders: SentenceMatchKeyword[][] = [];
	const frenchAnswers = sentence.frenchArticleFreeAnswers ?? sentence.frenchAnswers;
	const isEmpty = !/[\p{L}\p{N}]/u.test(answer);
	const result: SentenceAnswerReview = {
		status: 'incorrect',
		acceptedAnswer: null,
		words: tokens.parts,
		missingWordCount: 0,
	};
	let bestMatch: SentenceMatch | undefined;

	// A translation may have several valid wordings. Collect the ones this sentence allows.
	if (language === 'english') {
		acceptedOrders.push(
			sentence.keywords.map(keyword => {
				const result: SentenceMatchKeyword = {
					alternatives: keyword.englishWords.map(getSentenceKeywords),
					isProperNoun: keyword.isProperNoun ?? false,
				};

				return result;
			}),
		);

		if (sentence.englishText) {
			acceptedOrders.push(getTextKeywords(sentence.englishText, language, properNouns));
		}
	} else {
		for (const frenchAnswer of frenchAnswers) {
			acceptedOrders.push(getTextKeywords(frenchAnswer, language, properNouns));
		}
	}

	// Give the player credit for the accepted wording their answer fits best.
	for (const keywords of acceptedOrders) {
		if (keywords.length > 0) {
			const match = matchSentenceKeywords(tokens.words, keywords, language);

			bestMatch = getBetterMatch(bestMatch, match);
		}
	}

	// Show the colors on the player's own words so they can see which parts of their answer to fix.
	for (let position = 0; position < tokens.words.length; position++) {
		const word = tokens.words[position];
		const part = result.words[word.partIndex];
		const status = bestMatch?.words[position] ?? 'incorrect';

		if (part.status !== 'incorrect' && status !== 'neutral') {
			part.status = status;
		}
	}

	result.missingWordCount = bestMatch?.missingWordCount ?? 0;

	if (isEmpty) {
		result.status = 'empty';
	} else if (bestMatch?.cost === 0) {
		result.status = 'exact';
		result.acceptedAnswer = answer.trim();
	}

	return result;
}

/*
 * Check an English translation using the word cards and the story's English text.
 * This gives the player more than one way to say the same thing.
 */
export function checkSentenceAnswer(options: CheckSentenceAnswerOptions): SolveAnswerResult {
	const reviewOptions: ReviewSentenceAnswerOptions = {
		...options,
		language: 'english',
	};
	const result = reviewSentenceAnswer(reviewOptions);

	return result;
}

/*
 * Check a French translation against the story's French sentence.
 * Accents and name spelling should not make an otherwise correct translation fail.
 */
export function checkFrenchSentenceAnswer(options: CheckSentenceAnswerOptions): SolveAnswerResult {
	const reviewOptions: ReviewSentenceAnswerOptions = {
		...options,
		language: 'french',
	};
	const result = reviewSentenceAnswer(reviewOptions);

	return result;
}
