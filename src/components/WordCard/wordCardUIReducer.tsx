import { type Word } from '../CardDeck/cardDeckTypes';
import {
  type CardMistake,
  getFeedbackKey,
  type WordCardStateProps,
} from './wordCardContext';

/**
 * Typing
 */
export type WordCardUIAction =
  | {
    type: 'SELECT_ARTICLE';
    word: string;
  }
  | {
    type: 'SELECT_WORD';
    word: string
  }
  | {
    type: 'CHECK_ANSWER';
    currentCard: Word | undefined
  };

/**
 * Compare the user's selection against actual
 */
function getMistake(
  state: WordCardStateProps,
  currentCard: Word,
): CardMistake {
  let mistake: CardMistake = 'NONE';

  if (
    currentCard.englishArticle &&
    currentCard.englishArticle !== state.selectedArticle
  ) {
    mistake = 'ARTICLE';
  }

  if (
    !state.selectedWord ||
    !currentCard.englishWords.includes(state.selectedWord)
  ) {
    mistake = mistake === 'ARTICLE' ? 'BOTH' : 'WORD';
  }

  return mistake;
}

/**
 * WordCardUI state reducer
 */
export function wordCardUIReducer(
  state: WordCardStateProps,
  action: WordCardUIAction,
): WordCardStateProps {
  switch (action.type) {
    case 'CHECK_ANSWER': {
      const nextAttempts = state.attempts + 1;

      /**
       * What we do depends on what stage the card is in.
       */
      switch (state.stage) {
        /**
         * READY is initial value, so this is the first time
         * the user hit the 'Check' button. Check if the user
         * got the right answer or made a mistake.
         */
        case 'READY': {
          if (!action.currentCard) return state;

          const mistake = getMistake(state, action.currentCard);

          /**
           * Check if the user has reached
           * the max allowed attempts.
           */
          if (mistake !== 'NONE' && nextAttempts >= state.maxAttempts) {
            const nextState: WordCardStateProps = {
              ...state,
              progress: 'DANGER',
              stage: 'INCORRECT',
              mistake,
              attempts: nextAttempts,
            };

            return {
              ...nextState,
              feedbackKey: getFeedbackKey(nextState),
            };
          }

          /**
           * User made a mistake but still has attempts left.
           */
          if (mistake !== 'NONE') {
            const nextState: WordCardStateProps = {
              ...state,
              progress: 'WARNING',
              mistake,
              attempts: nextAttempts,
            };

            return {
              ...nextState,
              feedbackKey: getFeedbackKey(nextState),
            };
          }

          /**
           * User got the answer correct ↓
           */
          const nextState: WordCardStateProps = {
            ...state,
            progress: 'SUCCESS',
            stage: 'CORRECT',
            mistake: 'NONE',
            attempts: nextAttempts,
          };

          return {
            ...nextState,
            feedbackKey: getFeedbackKey(nextState),
          };
        }

        /**
         * CORRECT means We were already showing the user
         * the other side of the card (with correct answers).
         * Mark this one completed.
         */
        case 'CORRECT': {
          const nextState: WordCardStateProps = {
            ...state,
            progress: 'SUCCESS',
            stage: 'COMPLETED',
            attempts: nextAttempts,
          };

          return {
            ...nextState,
            feedbackKey: getFeedbackKey(nextState),
          };
        }

        /**
         * INCORRECT means the user got it wrong and
         * ran out of attempts. Progress the card
         * without upping the word score.
         */
        case 'INCORRECT': {
          const nextState: WordCardStateProps = {
            ...state,
            progress: 'DANGER',
            stage: 'COMPLETED',
            attempts: nextAttempts,
          };

          return {
            ...nextState,
            feedbackKey: getFeedbackKey(nextState),
          };
        }
        case 'COMPLETED':
          return state;
      }
    }


    case 'SELECT_ARTICLE': {
      if (state.stage !== 'READY') return state;

      const nextState: WordCardStateProps = {
        ...state,
        selectedArticle:
          action.word !== state.selectedArticle ? action.word : null,
        mistake: 'NONE',
        progress: 'PENDING',
      };

      return {
        ...nextState,
        feedbackKey: getFeedbackKey(nextState),
      };
    }
    case 'SELECT_WORD': {
      if (state.stage !== 'READY') return state;

      const nextState: WordCardStateProps = {
        ...state,
        selectedWord: action.word !== state.selectedWord ? action.word : null,
        mistake: 'NONE',
        progress: 'PENDING',
      };

      return {
        ...nextState,
        feedbackKey: getFeedbackKey(nextState),
      };
    }
  }
}
