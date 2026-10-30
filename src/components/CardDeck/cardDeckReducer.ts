import { CardDeckStateProps } from './cardDeckContext';
import type { CardDeck } from './cardDeckTypes';
import type {
	DeckCompletionReceiptProps,
	DeckSessionProps,
	WordAnswerAwardProps,
} from './deckSessionTypes';

/**
 * Typing
 */
export type CardDeckAction =
	| { type: 'NEXT_CARD' }
	| { type: 'INCREMENT_WORD_SCORE' }
	| { type: 'ADD_CORRECT_WORD'; award: WordAnswerAwardProps }
	| { type: 'ADD_INCORRECT_WORD'; skipped?: boolean }
	| { type: 'COMPLETE_DECK'; receipt: DeckCompletionReceiptProps }
	| {
			type: 'SET_DECK';
			payload: CardDeck;
			session: DeckSessionProps;
			currentIndex?: number;
	  };

/**
 * Track the current flashcard, answers, and completion results.
 * Restore saved answers and the current card when reopening a deck so the learner can continue.
 */
export function cardDeckReducer(
	state: CardDeckStateProps,
	action: CardDeckAction,
): CardDeckStateProps {
	const currentWord = state.cardDeck.words[state.currentIndex];

	switch (action.type) {
		case 'NEXT_CARD': {
			const nextIndex = state.currentIndex + 1;
			const nextWord = state.cardDeck.words[nextIndex];

			return {
				...state,
				currentIndex: nextIndex,
				currentId: nextWord?.id ?? state.currentId,
			};
		}
		case 'INCREMENT_WORD_SCORE': {
			const words = [...state.cardDeck.words];

			words[state.currentIndex] = {
				...currentWord,
				correctCount: currentWord.correctCount + 1,
			};

			return {
				...state,
				cardDeck: {
					...state.cardDeck,
					words,
				},
			};
		}
		case 'ADD_CORRECT_WORD': {
			if (state.correctWords.some(word => word.id === currentWord.id)) return state;

			let session = state.session;

			if (session) {
				session = {
					...session,
					results: [
						...session.results.filter(result => result.wordId !== currentWord.id),
						{ wordId: currentWord.id, outcome: 'correct', ...action.award },
					],
				};
			}

			return {
				...state,
				correctWords: [...state.correctWords, currentWord],
				incorrectWords: state.incorrectWords.filter(word => word.id !== currentWord.id),
				session,
			};
		}
		case 'ADD_INCORRECT_WORD': {
			if (state.incorrectWords.some(word => word.id === currentWord.id)) return state;

			let session = state.session;
			let outcome: 'incorrect' | 'skipped' = 'incorrect';

			if (action.skipped) {
				outcome = 'skipped';
			}

			if (session) {
				session = {
					...session,
					results: [
						...session.results.filter(result => result.wordId !== currentWord.id),
						{ wordId: currentWord.id, outcome, xp: 0, ink: 0 },
					],
				};
			}

			return {
				...state,
				incorrectWords: [...state.incorrectWords, currentWord],
				correctWords: state.correctWords.filter(word => word.id !== currentWord.id),
				session,
			};
		}
		case 'COMPLETE_DECK': {
			let session = state.session;

			/**
			 * To complete a deck, completion needs at least one correct word.
			 */
			const hasCorrectWord = Boolean(session?.results.some(result => result.outcome === 'correct'));

			if (session) {
				session = { ...session, completion: action.receipt };
			}

			return {
				...state,
				isComplete: hasCorrectWord,
				session,
			};
		}
		case 'SET_DECK': {
			const currentIndex = action.currentIndex ?? 0;
			const nextCurrentId = action.payload.words[currentIndex]?.id ?? '';
			const correctResults = action.session.results.filter(result => result.outcome === 'correct');
			const incorrectResults = action.session.results.filter(
				result => result.outcome !== 'correct',
			);
			const correctWordIds = correctResults.map(result => result.wordId);
			const incorrectWordIds = incorrectResults.map(result => result.wordId);
			const correctWords = action.payload.words.filter(word => correctWordIds.includes(word.id));
			const incorrectWords = action.payload.words.filter(word =>
				incorrectWordIds.includes(word.id),
			);

			return {
				...state,
				cardDeck: action.payload,
				isComplete: false,
				currentIndex,
				currentId: nextCurrentId,
				correctWords,
				incorrectWords,
				session: action.session,
			};
		}
	}
}
