import { CardDeckStateProps } from '@/src/components/CardDeck/cardDeckContext';
import { cardDeckReducer } from '@/src/components/CardDeck/cardDeckReducer';
import {
	makeMockCardDeck,
	mockWords,
} from '@/src/components/CardDeck/mockCardDeck';

/**
 * Mock words
 */
const [firstWord, secondWord, thirdWord] = mockWords;

/**
 * Mock reducer state
 */
function mockState(words = [firstWord, secondWord]): CardDeckStateProps {
	return {
		currentIndex: 0,
		currentId: words[0]?.id ?? '',
		cardDeck: makeMockCardDeck({ words }),
		correctWords: [],
		incorrectWords: [],
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

	test('adds the current word to correct words', () => {
		const state = {
			...mockState(),
			incorrectWords: [firstWord],
		};

		const nextState = cardDeckReducer(state, { type: 'ADD_CORRECT_WORD' });

		expect(nextState.correctWords).toEqual([firstWord]);
		expect(nextState.incorrectWords).toEqual([firstWord]);
	});

	test('adds the current word to incorrect words', () => {
		const state = {
			...mockState(),
			correctWords: [firstWord],
		};

		const nextState = cardDeckReducer(state, { type: 'ADD_INCORRECT_WORD' });

		expect(nextState.correctWords).toEqual([firstWord]);
		expect(nextState.incorrectWords).toEqual([firstWord]);
	});

	/**
	 * Make sure setting a new deck gives us expected state
	 */
	test('sets a new deck and starts at the first card', () => {
		const state = mockState();
		const newDeck = makeMockCardDeck({ words: [thirdWord] });

		const nextState = cardDeckReducer(state, {
			type: 'SET_DECK',
			payload: newDeck,
		});

		expect(nextState.cardDeck).toBe(newDeck);
		expect(nextState.currentIndex).toBe(0);
		expect(nextState.currentId).toBe(thirdWord.id);
		expect(nextState.correctWords).toEqual([]);
		expect(nextState.incorrectWords).toEqual([]);
	});
});
