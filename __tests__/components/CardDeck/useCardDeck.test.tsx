import {
  CardDeckContext,
  CardDeckStateProps,
} from '@/src/components/CardDeck/cardDeckContext';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { renderHook } from '@testing-library/react-native';
import { ReactNode } from 'react';

/**
 * Mock some more words
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

/**
 * Mock a deck
 */
function makeDeck(words: Word[]): CardDeck {
  return {
    title: 'Testing deck',
    description: 'A deck for tests',
    CEFR: ['A1'],
    wordIds: words.map((word) => word.id),
    image: undefined,
    words,
  };
}

/**
 * Mock context state
 */
function mockState(currentIndex = 0): CardDeckStateProps {
  return {
    currentIndex,
    currentId: firstWord.id,
    cardDeck: makeDeck([firstWord, secondWord]),
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
