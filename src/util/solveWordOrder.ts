import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveWordOrderCard } from '@/src/components/Solve/solveTypes';
import { getSolvePassage, type SolvePassageSegment } from './getSolvePassage';
import shuffleArray from './shuffleArray';
import { splitFrenchSentences, type SentencePassage } from './splitFrenchSentences';

/**
 * Typing
 */
export interface CheckWordOrderAnswerOptions {
	deck: Paragraph;
	positions: number[];
	sentencePosition?: number;
	lockedCardIds?: number[];
}

export interface WordOrderSentence extends SentencePassage {
	originalSentencePositions: number[];
}

/**
 * Sometimes sentences are one word. It is actually super confusing looking
 * on the puzzle view when this happens so instead of having one word
 * sentences to solve we just combine them with the next or previous
 * sentence instead.
 */
export function getWordOrderSentences(deck: Paragraph): WordOrderSentence[] {
	/**
	 * Store the original sentences and puzzle groups
	 */
	const sentences = splitFrenchSentences(deck);
	const groups: WordOrderSentence[] = [];
	let pendingGroup: WordOrderSentence | undefined;

	for (const [sentencePosition, sentence] of sentences.entries()) {
		const wordCards = sentence.segments.filter(segment => /[\p{L}\p{N}]/u.test(segment.text));

		if (!pendingGroup) {
			pendingGroup = {
				text: '',
				segments: [],
				originalSentencePositions: [],
			};
		}

		if (pendingGroup.text) {
			pendingGroup.text += ' ';
		}

		pendingGroup.text += sentence.text;
		pendingGroup.segments.push(...sentence.segments);
		pendingGroup.originalSentencePositions.push(sentencePosition);

		if (wordCards.length > 1) {
			groups.push(pendingGroup);
			pendingGroup = undefined;
		}
	}

	if (pendingGroup) {
		const previousGroup = groups[groups.length - 1];

		if (previousGroup) {
			previousGroup.text += ` ${pendingGroup.text}`;
			previousGroup.segments.push(...pendingGroup.segments);
			previousGroup.originalSentencePositions.push(...pendingGroup.originalSentencePositions);
		} else {
			groups.push(pendingGroup);
		}
	}

	return groups;
}

/**
 * Creates puzzle cards from the French passage, keeping each card's punctuation.
 */
export function getWordOrderCardsFromSegments(
	passage: SolvePassageSegment[],
): SolveWordOrderCard[] {
	const cards: SolveWordOrderCard[] = [];

	for (const segment of passage) {
		const textWithPunctuation = segment.text + (segment.after ?? ' ');
		const text = textWithPunctuation.trim();

		if (text) {
			cards.push({
				id: segment.position,
				text,
			});
		}
	}

	return cards;
}

/**
 * Creates the puzzle cards for a sentence group (or the whole paragraph).
 */
export function getWordOrderCards(
	deck: Paragraph,
	sentencePosition?: number,
): SolveWordOrderCard[] {
	let passage = getSolvePassage(deck.passage);

	if (sentencePosition !== undefined) {
		passage = getWordOrderSentences(deck)[sentencePosition]?.segments ?? [];
	}

	return getWordOrderCardsFromSegments(passage);
}

/**
 * Checks that the card order includes every card exactly once.
 */
export function isCompleteWordOrder(
	positions: unknown,
	cards: SolveWordOrderCard[],
): positions is number[] {
	const cardIds = new Set(cards.map(card => card.id));
	const usedIds = new Set<number>();

	if (!Array.isArray(positions) || positions.length !== cards.length) {
		return false;
	}

	for (const position of positions) {
		if (!Number.isInteger(position) || !cardIds.has(position) || usedIds.has(position)) {
			return false;
		}

		usedIds.add(position);
	}

	return cards.length > 0;
}

/**
 * Reads a saved card order and checks that it contains the puzzle's cards.
 */
export function readWordOrder(value: string, cards: SolveWordOrderCard[]): number[] | null {
	let positions: unknown;

	try {
		positions = JSON.parse(value);
	} catch {
		return null;
	}

	return isCompleteWordOrder(positions, cards) ? positions : null;
}

/**
 * Finds the most correctly placed cards in an accepted answer while keeping locked cards in place.
 */
export function getCorrectWordOrderCardIds({
	deck,
	positions,
	sentencePosition,
	lockedCardIds = [],
}: CheckWordOrderAnswerOptions): number[] {
	const cards = getWordOrderCards(deck, sentencePosition);
	const paragraphCards = getWordOrderCards(deck);
	const cardsById = new Map(cards.map(card => [card.id, card.text]));
	const originalOrder = cards.map(card => card.id);
	const acceptedOrders = [originalOrder];
	let correctCardIds: number[] = [];

	for (const paragraphOrder of deck.acceptedWordOrders ?? []) {
		if (!isCompleteWordOrder(paragraphOrder, paragraphCards)) {
			throw new Error(
				`An accepted Solve++ order for paragraph ${deck.id} is missing or repeating cards.`,
			);
		}

		const sentenceOrder = paragraphOrder.filter(cardId => cardsById.has(cardId));

		acceptedOrders.push(sentenceOrder);
	}

	if (!isCompleteWordOrder(positions, cards)) {
		return correctCardIds;
	}

	for (const acceptedOrder of acceptedOrders) {
		if (!isCompleteWordOrder(acceptedOrder, cards)) {
			throw new Error(
				`An accepted Solve++ order for paragraph ${deck.id} is missing or repeating cards.`,
			);
		}

		const matchingCardIds = positions.filter((cardId, index) => {
			return cardsById.get(cardId) === cardsById.get(acceptedOrder[index]);
		});
		const matchingCards = new Set(matchingCardIds);
		const keepsLockedCards = lockedCardIds.every(cardId => matchingCards.has(cardId));

		if (keepsLockedCards && matchingCardIds.length > correctCardIds.length) {
			correctCardIds = matchingCardIds;
		}
	}

	return correctCardIds;
}

/**
 * Checks whether all the cards are in an accepted order.
 */
export function checkWordOrderAnswer(options: CheckWordOrderAnswerOptions): boolean {
	const cards = getWordOrderCards(options.deck, options.sentencePosition);
	const correctCardIds = getCorrectWordOrderCardIds(options);

	return cards.length > 0 && correctCardIds.length === cards.length;
}

/**
 * Checks whether locked cards stayed in their previous positions.
 */
export function areLockedWordOrderCardsInPlace(
	previousPositions: number[],
	nextPositions: number[],
	lockedCardIds: number[],
): boolean {
	return lockedCardIds.every(cardId => {
		const savedIndex = previousPositions.indexOf(cardId);

		return savedIndex >= 0 && nextPositions[savedIndex] === cardId;
	});
}

/**
 * Shuffles the cards into a starting order for the puzzle.
 */
export function shuffleWordOrder(deck: Paragraph, sentencePosition?: number): number[] {
	const cards = getWordOrderCards(deck, sentencePosition);
	const cardIds = cards.map(card => card.id);
	const positions = shuffleArray(cardIds);
	const cardsById = new Map(cards.map(card => [card.id, card.text]));
	const firstCardText = cardsById.get(positions[0]);
	const differentCardIndex = positions.findIndex(cardId => cardsById.get(cardId) !== firstCardText);

	if (
		checkWordOrderAnswer({
			deck,
			positions,
			sentencePosition,
		}) &&
		differentCardIndex > 0
	) {
		const firstCardId = positions[0];

		positions[0] = positions[differentCardIndex];
		positions[differentCardIndex] = firstCardId;
	}

	return positions;
}

/**
 * Moves a card to another unlocked position and keeps locked cards in place.
 */
export function moveWordOrderCard(
	positions: number[],
	fromIndex: number,
	toIndex: number,
	lockedCardIds: number[] = [],
): number[] {
	const nextPositions = [...positions];
	const cardId = positions[fromIndex];
	const targetCardId = positions[toIndex];
	const lockedCards = new Set(lockedCardIds);
	const movablePositions = positions.filter(position => !lockedCards.has(position));
	const movableFromIndex = movablePositions.indexOf(cardId);
	const movableToIndex = movablePositions.indexOf(targetCardId);
	let movableIndex = 0;

	if (
		fromIndex < 0 ||
		toIndex < 0 ||
		fromIndex >= positions.length ||
		toIndex >= positions.length ||
		lockedCards.has(cardId) ||
		lockedCards.has(targetCardId)
	) {
		return nextPositions;
	}

	movablePositions.splice(movableFromIndex, 1);
	movablePositions.splice(movableToIndex, 0, cardId);

	for (let positionIndex = 0; positionIndex < positions.length; positionIndex++) {
		if (!lockedCards.has(positions[positionIndex])) {
			nextPositions[positionIndex] = movablePositions[movableIndex];
			movableIndex++;
		}
	}

	return nextPositions;
}
