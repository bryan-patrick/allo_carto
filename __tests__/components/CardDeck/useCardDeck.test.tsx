import {
  CardDeckContext,
  CardDeckStateProps,
} from '@/src/components/CardDeck/cardDeckContext';
import {
  makeMockCardDeck,
  mockWords,
} from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { renderHook } from '@testing-library/react-native';
import { ReactNode } from 'react';

/**
 * Mock some more words
 */
const [firstWord, secondWord] = mockWords;

/**
 * Mock context state
 */
function mockState(currentIndex = 0): CardDeckStateProps {
  return {
    currentIndex,
    currentId: firstWord.id,
    cardDeck: makeMockCardDeck({ words: [firstWord, secondWord] }),
    correctWords: [],
    incorrectWords: [],
  };
}

describe('useCardDeck', () => {
  test('returns the card deck state, dispatch, and current card', () => {
    const cardDeckState = mockState(1);
    const cardDeckDispatch = jest.fn();

    /**
     * Context wrapper
     */
    function ContextWrapper({ children }: { children: ReactNode }) {
      return (
        <CardDeckContext.Provider value={{ cardDeckState, cardDeckDispatch }}>
          {children}
        </CardDeckContext.Provider>
      );
    }

    const { result } = renderHook(() => useCardDeck(), { wrapper: ContextWrapper });

    expect(result.current.cardDeckState).toBe(cardDeckState);
    expect(result.current.cardDeckDispatch).toBe(cardDeckDispatch);
    expect(result.current.currentCard).toBe(secondWord);
  });
});
