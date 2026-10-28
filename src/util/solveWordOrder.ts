import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { SolveWordOrderCard } from '@/src/components/Solve/solveTypes';
import { getSolvePassage } from './getSolvePassage';
import shuffleArray from './shuffleArray';

/**
 * Typing
 */
export interface CheckWordOrderAnswerOptions {
	deck: CardDeck;
	positions: number[];
}

/**
 * Builds the French cards that the player arranges in Solve++.
 */
export function getWordOrderCards(deck: CardDeck): SolveWordOrderCard[] {
	const passage = getSolvePassage(deck.passage);
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
 * Checks that an arrangement contains every card exactly once before it is saved or checked as an answer.
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
 * Reads a saved card order so the player can resume Solve++.
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
 * Checks whether the player's arrangement matches the paragraph or another accepted answer.
 */
export function checkWordOrderAnswer({ deck, positions }: CheckWordOrderAnswerOptions): boolean {
	const cards = getWordOrderCards(deck);
	const cardsById = new Map(cards.map(card => [card.id, card.text]));
	const originalOrder = cards.map(card => card.id);
	const acceptedOrders = [originalOrder, ...(deck.acceptedWordOrders ?? [])];

	if (!isCompleteWordOrder(positions, cards)) {
		return false;
	}

	for (const acceptedOrder of acceptedOrders) {
		if (!isCompleteWordOrder(acceptedOrder, cards)) {
			throw new Error(`An accepted Solve++ order for ${deck.title} is missing or repeating cards.`);
		}

		const matches = positions.every((cardId, index) => {
			return cardsById.get(cardId) === cardsById.get(acceptedOrder[index]);
		});

		if (matches) {
			return true;
		}
	}

	return false;
}

/**
 * Creates a shuffled starting order for Solve++.
 */
export function shuffleWordOrder(deck: CardDeck): number[] {
	const cards = getWordOrderCards(deck);
	const cardIds = cards.map(card => card.id);
	const positions = shuffleArray(cardIds);
	const cardsById = new Map(cards.map(card => [card.id, card.text]));
	const firstCardText = cardsById.get(positions[0]);
	const differentCardIndex = positions.findIndex(cardId => cardsById.get(cardId) !== firstCardText);

	if (
		checkWordOrderAnswer({
			deck,
			positions,
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
 * Moves one card to a chosen spot and shifts the cards in between.
 */
export function moveWordOrderCard(
	positions: number[],
	fromIndex: number,
	toIndex: number,
): number[] {
	const nextPositions = [...positions];
	const cardId = positions[fromIndex];

	if (
		fromIndex < 0 ||
		toIndex < 0 ||
		fromIndex >= positions.length ||
		toIndex >= positions.length
	) {
		return nextPositions;
	}

	nextPositions.splice(fromIndex, 1);
	nextPositions.splice(toIndex, 0, cardId);

	return nextPositions;
}
