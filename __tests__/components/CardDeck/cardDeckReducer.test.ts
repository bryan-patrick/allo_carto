import { CardDeckStateProps } from '@/src/components/CardDeck/cardDeckContext';
import { cardDeckReducer } from '@/src/components/CardDeck/cardDeckReducer';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { Word } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Mock words
 */
const firstWord: Word = {
	id: 'word_noun_cafe',
	frenchWord: 'cafe',
	englishWords: ['coffee'],
	pronunciation: 'ka-fay',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 14,
};

const secondWord: Word = {
	id: 'word_noun_livre',
	frenchWord: 'livre',
	englishWords: ['book'],
	pronunciation: 'leev-ruh',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 7,
};

const thirdWord: Word = {
	id: 'word_noun_pomme',
	frenchWord: 'pomme',
	englishWords: ['apple'],
	pronunciation: 'pom',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 11,
};

/**
 * Make a deck
 */
function mockDeck(words: Word[]): CardDeck {
	return {
		title: 'Testing deck',
		description: 'A deck for tests',
		CEFR: ['A1'],
		wordIds: words.map(word => word.id),
		image: undefined,
		words,
	};
}

/**
 * Mock reducer state
 */
function mockState(words = [firstWord, secondWord]): CardDeckStateProps {
	return {
		currentIndex: 0,
		currentId: words[0]?.id ?? '',
		cardDeck: mockDeck(words),
	};
}

/**
 * Test next card action
 */
describe('cardDeckReducer', () => {
	test('moves to the next card', () => {
		const state = mockState();

		const nextState = cardDeckReducer(state, { type: 'NEXT_CARD' });

		expect(nextState.currentIndex).toBe(1);
		expect(nextState.currentId).toBe(secondWord.id);
	});

	/**
	 * Test increment word score action
	 */
	test('increments only the current word score', () => {
		const state = {
			...mockState(),
			currentIndex: 1,
			currentId: secondWord.id,
		};

		const nextState = cardDeckReducer(state, { type: 'INCREMENT_WORD_SCORE' });

		expect(nextState.cardDeck.words[0].correctCount).toBe(
			firstWord.correctCount,
		);
		expect(nextState.cardDeck.words[1].correctCount).toBe(
			secondWord.correctCount + 1,
		);
	});

	/**
	 * Make sure setting a new deck gives us expected state
	 */
	test('sets a new deck and starts at the first card', () => {
		const state = mockState();
		const newDeck = mockDeck([thirdWord]);

		const nextState = cardDeckReducer(state, {
			type: 'SET_DECK',
			payload: newDeck,
		});

		expect(nextState.cardDeck).toBe(newDeck);
		expect(nextState.currentIndex).toBe(0);
		expect(nextState.currentId).toBe(thirdWord.id);
	});
});
