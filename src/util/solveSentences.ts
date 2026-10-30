import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveSentence, SolveSentenceKeyword } from '@/src/components/Solve/solveTypes';
import { getSolvePassage, type SolvePassageSegment } from './getSolvePassage';
import { getSentenceKeywords } from './solveSentenceAnswer';
import { getWordOrderCards, isCompleteWordOrder } from './solveWordOrder';

/*
 * Typing
 */
export interface SolveSentenceWord {
	id: string;
	englishWords: string[];
	partOfSpeech: string | null;
}

interface SentencePassage {
	text: string;
	segments: SolvePassageSegment[];
}

/*
 * Keep the sentence's French wording and any other card orders accepted for the paragraph.
 */
function getFrenchSentenceAnswers(sentence: SentencePassage, deck: CardDeck): string[] {
	const answers = [sentence.text];
	const cards = getWordOrderCards(deck);
	const segmentsByPosition = new Map(sentence.segments.map(segment => [segment.position, segment]));

	for (const acceptedOrder of deck.acceptedWordOrders ?? []) {
		const sentencePositions = acceptedOrder.filter(position => segmentsByPosition.has(position));
		let alternativeText = '';

		if (!isCompleteWordOrder(acceptedOrder, cards)) {
			throw new Error(`An accepted French order for ${deck.title} is missing or repeating cards.`);
		}

		for (const position of sentencePositions) {
			const segment = segmentsByPosition.get(position)!;

			alternativeText += segment.text + (segment.after ?? ' ');
		}

		answers.push(alternativeText.trim());
	}

	return answers;
}

/*
 * Splits the French paragraph into sentences and keeps its words and punctuation.
 */
function splitFrenchSentences(deck: CardDeck): SentencePassage[] {
	const passage = getSolvePassage(deck.passage);
	const sentences: SentencePassage[] = [];
	let text = '';
	let segments: SolvePassageSegment[] = [];

	for (const segment of passage) {
		const textWithPunctuation = segment.text + (segment.after ?? ' ');
		const endsSentence = /[.!?…][\s»”"'’)\]]*$/u.test(textWithPunctuation);
		const isClosingPunctuation = /^[\s»”’)\]]+$/u.test(textWithPunctuation);
		const previousSentence = sentences[sentences.length - 1];

		if (!text && previousSentence && isClosingPunctuation) {
			previousSentence.text += ` ${textWithPunctuation.trim()}`;
			previousSentence.segments.push(segment);
			continue;
		}

		text += textWithPunctuation;
		segments.push(segment);

		if (endsSentence) {
			sentences.push({
				text: text.trim(),
				segments,
			});
			text = '';
			segments = [];
		}
	}

	if (/[\p{L}\p{N}]/u.test(text)) {
		sentences.push({
			text: text.trim(),
			segments,
		});
	} else if (text.trim() && sentences.length > 0) {
		const previousSentence = sentences[sentences.length - 1];

		previousSentence.text += ` ${text.trim()}`;
		previousSentence.segments.push(...segments);
	}

	return sentences;
}

/*
 * Builds each sentence's keywords from the meanings already on its word cards.
 */
function getSentenceCardKeywords(
	segments: SolvePassageSegment[],
	wordsById: Map<string, SolveSentenceWord>,
): SolveSentenceKeyword[] {
	const keywords: SolveSentenceKeyword[] = [];
	let hasJoinedNegation = false;

	for (const segment of segments) {
		const word = segment.wordId && !segment.unlockExempt ? wordsById.get(segment.wordId) : null;
		const frenchText = segment.text.toLowerCase();
		const plainApostrophes = frenchText.replace(/[’ʼ]/gu, "'");

		if (segment.wordId && !segment.unlockExempt && (!word || word.englishWords.length === 0)) {
			throw new Error(`The dictionary meaning for ${segment.text} is missing.`);
		}

		if (
			word?.partOfSpeech === 'article' ||
			word?.partOfSpeech === 'preposition' ||
			/^(?:ne|n')$/u.test(plainApostrophes)
		) {
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
 * Prepare French sentence prompts and accepted keywords from the paragraph's existing content.
 */
export function getSolveSentences(deck: CardDeck, words: SolveSentenceWord[]): SolveSentence[] {
	const frenchSentences = splitFrenchSentences(deck);
	const englishParts = deck.englishPassage?.match(/[^.!?…]+(?:[.!?…]+|$)/gu) ?? [];
	const englishSentences = englishParts.filter(text => /[\p{L}\p{N}]/u.test(text));
	const canPairEnglish = englishSentences.length === frenchSentences.length;
	const wordsById = new Map(words.map(word => [word.id, word]));

	return frenchSentences.map((sentence, position) => ({
		position,
		frenchText: sentence.text,
		frenchAnswers: getFrenchSentenceAnswers(sentence, deck),
		englishText: canPairEnglish ? englishSentences[position].trim() : null,
		keywords: getSentenceCardKeywords(sentence.segments, wordsById),
		acceptedAnswer: null,
	}));
}
