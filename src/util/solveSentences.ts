import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveSentence, SolveSentenceKeyword } from '@/src/components/Solve/solveTypes';
import type { SolvePassageSegment } from './getSolvePassage';
import { getFrenchSentencePreposition, getSentenceKeywords } from './solveSentenceAnswer';
import { getWordOrderCards, isCompleteWordOrder } from './solveWordOrder';
import { splitFrenchSentences, type SentencePassage } from './splitFrenchSentences';

/*
 * Typing
 */
export interface SolveSentenceWord {
	id: string;
	englishWords: string[];
	partOfSpeech: string | null;
}

/**
 * Check whether a word is a proper noun so the learner doesn't have to spell it correctly.
 */
function isSentenceProperNoun(
	segment: SolvePassageSegment,
	word: SolveSentenceWord | undefined,
): boolean {
	return Boolean(
		segment.unlockExempt ||
		word?.partOfSpeech === 'proper noun' ||
		segment.wordId?.startsWith('word_proper_noun_'),
	);
}

/*
 * Remove articles from the French answer so the learner can leave them out.
 * Prepositions still count.
 */
function getFrenchArticleFreeText(
	segments: SolvePassageSegment[],
	wordsById: Map<string, SolveSentenceWord>,
): string {
	let text = '';

	for (const segment of segments) {
		const word = segment.wordId ? wordsById.get(segment.wordId) : undefined;
		const isArticle =
			word?.partOfSpeech === 'article' || segment.wordId?.startsWith('word_article_');
		const isPreposition =
			word?.partOfSpeech === 'preposition' || segment.wordId?.startsWith('word_preposition_');

		if (isArticle) {
			continue;
		}

		if (isPreposition) {
			text += getFrenchSentencePreposition(segment.text) + ' ';
		} else {
			text += segment.text + (segment.after ?? ' ');
		}
	}

	return text.trim();
}

/*
 * Get the French answers the learner is allowed to give.
 */
function getFrenchSentenceAnswers(
	sentence: SentencePassage,
	deck: CardDeck,
	wordsById: Map<string, SolveSentenceWord>,
	omitArticles = false,
): string[] {
	const firstAnswer =
		omitArticles ? getFrenchArticleFreeText(sentence.segments, wordsById) : sentence.text;
	const answers = [firstAnswer];
	const cards = getWordOrderCards(deck);
	const segmentsByPosition = new Map(sentence.segments.map(segment => [segment.position, segment]));

	for (const acceptedOrder of deck.acceptedWordOrders ?? []) {
		const sentencePositions = acceptedOrder.filter(position => segmentsByPosition.has(position));
		const alternativeSegments: SolvePassageSegment[] = [];
		let alternativeText = '';

		if (!isCompleteWordOrder(acceptedOrder, cards)) {
			throw new Error(`An accepted French order for ${deck.title} is missing or repeating cards.`);
		}

		for (const position of sentencePositions) {
			const segment = segmentsByPosition.get(position)!;

			alternativeText += segment.text + (segment.after ?? ' ');
			alternativeSegments.push(segment);
		}

		if (omitArticles) {
			answers.push(getFrenchArticleFreeText(alternativeSegments, wordsById));
		} else {
			answers.push(alternativeText.trim());
		}
	}

	return answers;
}

/*
 * Find the English meanings that count as correct for this sentence.
 */
function getSentenceCardKeywords(
	segments: SolvePassageSegment[],
	wordsById: Map<string, SolveSentenceWord>,
): SolveSentenceKeyword[] {
	const keywords: SolveSentenceKeyword[] = [];
	let hasJoinedNegation = false;

	for (const segment of segments) {
		const word =
			segment.wordId && !segment.unlockExempt ? wordsById.get(segment.wordId) : undefined;
		const frenchText = segment.text.toLowerCase();
		const plainApostrophes = frenchText.replace(/[’ʼ]/gu, "'");

		if (segment.wordId && !segment.unlockExempt && (!word || word.englishWords.length === 0)) {
			throw new Error(`The dictionary meaning for ${segment.text} is missing.`);
		}

		if (word?.partOfSpeech === 'article' || /^(?:ne|n')$/u.test(plainApostrophes)) {
			continue;
		}

		if (plainApostrophes === 'pas' && hasJoinedNegation) {
			hasJoinedNegation = false;
			continue;
		}

		const englishWords = word ? word.englishWords : [segment.text];
		const keywordOptions = englishWords.map(getSentenceKeywords);
		const canBeLeftOut = keywordOptions.some(option => option.length === 0);

		if (!canBeLeftOut && keywordOptions.length > 0) {
			keywords.push({
				englishWords,
				isProperNoun: isSentenceProperNoun(segment, word),
			});
		}

		if (
			plainApostrophes.startsWith("n'") &&
			keywordOptions.some(option => option.includes('not'))
		) {
			hasJoinedNegation = true;
		}
	}

	return keywords;
}

/*
 * Turns a paragraph into the individual sentence puzzles the learner will answer.
 */
export function getSolveSentences(deck: CardDeck, words: SolveSentenceWord[]): SolveSentence[] {
	const frenchSentences = splitFrenchSentences(deck);
	const englishParts = deck.englishPassage?.match(/[^.!?…]+(?:[.!?…]+|$)/gu) ?? [];
	const englishSentences = englishParts.filter(text => /[\p{L}\p{N}]/u.test(text));
	const canPairEnglish = englishSentences.length === frenchSentences.length;
	const wordsById = new Map(words.map(word => [word.id, word]));

	return frenchSentences.map((sentence, position) => {
		const properNouns: string[] = [];

		for (const segment of sentence.segments) {
			const word = segment.wordId ? wordsById.get(segment.wordId) : undefined;
			const isProperNoun = isSentenceProperNoun(segment, word);

			if (isProperNoun && /[\p{L}\p{N}]/u.test(segment.text)) {
				properNouns.push(segment.text);
				properNouns.push(...(word?.englishWords ?? []));
			}
		}

		return {
			position,
			frenchText: sentence.text,
			frenchAnswers: getFrenchSentenceAnswers(sentence, deck, wordsById),
			frenchArticleFreeAnswers: getFrenchSentenceAnswers(sentence, deck, wordsById, true),
			englishText: canPairEnglish ? englishSentences[position].trim() : null,
			keywords: getSentenceCardKeywords(sentence.segments, wordsById),
			properNouns,
			acceptedAnswer: null,
		};
	});
}
