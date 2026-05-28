import {
  CardDeckContext,
  initialCardDeckState,
} from '@/src/components/CardDeck/cardDeckContext';
import WordCard from '@/src/components/WordCard/WordCard';
import WordCardBack from '@/src/components/WordCard/WordCardBack';
import WordCardFront from '@/src/components/WordCard/WordCardFront';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ReactNode } from 'react';

/**
 * Mock the context
 */
jest.mock('@/src/components/WordCard/useWordCardUI');

/**
 * Mock the router
 */
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

/**
 * Mock front face.
 */
jest.mock('@/src/components/WordCard/WordCardFront', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word card front</Text>);
});

/**
 * Mock derrier.
 */
jest.mock('@/src/components/WordCard/WordCardBack', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => {
    return <Text>Word card back</Text>;
  });
});

/**
 * Mock mock omck mock moc k mock
 */
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockWordCardFront = jest.mocked(WordCardFront);
const mockWordCardBack = jest.mocked(WordCardBack);
const mockRouterPush = jest.mocked(router.push);

function renderWithAFakeDispatchSoWeCanDoActions(
  children: ReactNode,
  cardDeckDispatch = jest.fn(),
) {
  return {
    cardDeckDispatch,
    ...render(
      <CardDeckContext.Provider
        value={{
          cardDeckState: initialCardDeckState,
          cardDeckDispatch,
        }}
      >
        {children}
      </CardDeckContext.Provider>,
    ),
  };
}

describe('<WordCard />', () => {
  beforeEach(() => {
    mockWordCardFront.mockClear();
    mockWordCardBack.mockClear();
    mockRouterPush.mockClear();
    mockUseWordCardUI.mockReset();
  });

  /**
   * Make sure the cards are rendering
   */
  test('renders the front and back card faces', () => {
    mockUseWordCardUI.mockReturnValue({
      cardState: initialWordCardState,
      wordCardUIDispatch: jest.fn(),
    });

    const { getByText } = renderWithAFakeDispatchSoWeCanDoActions(<WordCard isCurrent={true} />);

    getByText('Word card front');
    getByText('Word card back');

    expect(mockWordCardFront).toHaveBeenCalledWith(
      expect.objectContaining({
        handleWordWidth: expect.any(Function),
        handleArticleWidth: expect.any(Function),
        articleWidthStyle: expect.any(Object),
        wordWidthStyle: expect.any(Object),
        wordCardFrontFlippedStyle: expect.any(Object),
      }),
      undefined,
    );

    expect(mockWordCardBack).toHaveBeenCalledWith(
      expect.objectContaining({
        wordCardBackFlippedStyle: expect.any(Object),
      }),
      undefined,
    );
  });

  /**
   * Test completion
   */
  test('routes to the finished deck when the last card completes', async () => {
    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        stage: 'COMPLETED',
      },
      wordCardUIDispatch: jest.fn(),
    });

    renderWithAFakeDispatchSoWeCanDoActions(<WordCard isCurrent={true} />);

    /**
     * Make sure we go to the finished deck
     */
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/FinishedDeck');
    });
  });
});
