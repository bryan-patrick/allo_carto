import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import {
  WordCardUIContext,
  initialWordCardState,
} from '@/src/components/WordCard/wordCardContext';
import { renderHook } from '@testing-library/react-native';
import { ReactNode } from 'react';

/**
 * Test the hook
 */
describe('useWordCardUI', () => {
  test('returns the word card UI context', () => {
    const cardState = {
      ...initialWordCardState,
      selectedWord: 'coffee',
    };
    const wordCardUIDispatch = jest.fn();

    /**
     * Provide a...err...provider...
     */
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <WordCardUIContext.Provider value={{ cardState, wordCardUIDispatch }}>
          {children}
        </WordCardUIContext.Provider>
      );
    }

    /**
     * Check the two state props
     */
    const { result } = renderHook(() => useWordCardUI(), { wrapper: Wrapper });
    expect(result.current.cardState).toBe(cardState);
    expect(result.current.wordCardUIDispatch).toBe(wordCardUIDispatch);
  });
});
