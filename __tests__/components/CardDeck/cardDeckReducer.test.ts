import { CardDeckStateProps } from '@/src/components/CardDeck/cardDeckContext';
import { cardDeckReducer } from '@/src/components/CardDeck/cardDeckReducer';
import { makeMockCardDeck, mockWords } from '@/src/components/CardDeck/mockCardDeck';

const [firstWord, secondWord, thirdWord] = mockWords;

function mockState(words = [firstWord, secondWord]): CardDeckStateProps {
	return {
		isComplete: false,
		currentIndex: 0,
		currentId: words[0]?.id ?? '',
		cardDeck: makeMockCardDeck({ words }),
		correctWords: [],
		incorrectWords: [],
	};
}

describe('cardDeckReducer', () => {
	test('moves to the next card', () => {
		const state = mockState();

		const nextState = cardDeckReducer(state, { type: 'NEXT_CARD' });

		expect(nextState.currentIndex).toBe(1);
		expect(nextState.currentId).toBe(secondWord.id);
	});

	test('increments only the current word score', () => {
		const state = {
			...mockState(),
			currentIndex: 1,
			currentId: secondWord.id,
		};

		const nextState = cardDeckReducer(state, { type: 'INCREMENT_WORD_SCORE' });

		expect(nextState.cardDeck.words[0].correctCount).toBe(firstWord.correctCount);
		expect(nextState.cardDeck.words[1].correctCount).toBe(secondWord.correctCount + 1);
		expect(state.cardDeck.words[1].correctCount).toBe(secondWord.correctCount);
	});

	test('adds the current word to correct words', () => {
		const state = {
			...mockState(),
			correctWords: [secondWord],
			incorrectWords: [thirdWord],
		};

		const nextState = cardDeckReducer(state, {
			type: 'ADD_CORRECT_WORD',
			award: { xp: 10, learningBonusXP: 0, previousProgress: 'mastered', nextProgress: 'mastered' },
		});

		expect(nextState.correctWords).toEqual([secondWord, firstWord]);
		expect(nextState.incorrectWords).toEqual([thirdWord]);
	});

	test('adds the current word to incorrect words', () => {
		const state = {
			...mockState(),
			correctWords: [thirdWord],
			incorrectWords: [secondWord],
		};

		const nextState = cardDeckReducer(state, { type: 'ADD_INCORRECT_WORD' });

		expect(nextState.correctWords).toEqual([thirdWord]);
		expect(nextState.incorrectWords).toEqual([secondWord, firstWord]);
	});

	test('sets a new deck and starts at the first card', () => {
		const state = {
			...mockState(),
			currentIndex: 1,
			currentId: secondWord.id,
			correctWords: [firstWord],
			incorrectWords: [secondWord],
		};
		const newDeck = makeMockCardDeck({ words: [thirdWord] });

		const nextState = cardDeckReducer(state, {
			type: 'SET_DECK',
			payload: newDeck,
			session: { id: 'new-session', xpBefore: 0, results: [] },
		});

		expect(nextState.cardDeck).toBe(newDeck);
		expect(nextState.currentIndex).toBe(0);
		expect(nextState.currentId).toBe(thirdWord.id);
		expect(nextState.correctWords).toEqual([]);
		expect(nextState.incorrectWords).toEqual([]);
	});
});
