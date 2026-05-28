import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCardButton from '@/src/components/WordCard/WordCardButton';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

/**
 * Mock all the things
 */
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockNotificationAsync = jest.mocked(Haptics.notificationAsync);

/**
 * Mock state
 */
function mockDeckState(cardDeckDispatch = jest.fn()) {
  const currentCard = {
    id: 'word_noun_cafe',
    frenchWord: 'cafe',
    englishArticle: 'The',
    englishWords: ['coffee'],
    pronunciation: 'ka-fay',
    isVulgar: false,
    CEFR: 'A1' as const,
    userScore: 14,
  };

  mockUseCardDeck.mockReturnValue({
    cardDeckState: {
      currentIndex: 0,
      currentId: currentCard.id,
      cardDeck: {
        title: 'Testing deck',
        description: 'A deck for tests',
        CEFR: ['A1'],
        wordIds: [currentCard.id],
        words: [currentCard],
      },
    },
    cardDeckDispatch,
    currentCard,
  });

  return { cardDeckDispatch, currentCard };
}

describe('<WordCardButton />', () => {
  beforeEach(() => {
    mockNotificationAsync.mockClear();
    mockUseCardDeck.mockReset();
    mockUseWordCardUI.mockReset();
  });

  test('disables itself until the answer has been selected', () => {
    mockDeckState();
    mockUseWordCardUI.mockReturnValue({
      cardState: initialWordCardState,
      wordCardUIDispatch: jest.fn(),
    });

    const { UNSAFE_getByProps } = render(
      <WordCardButton>Check</WordCardButton>,
    );

    /**
     * No selected article or selected word
     */
    UNSAFE_getByProps({ disabled: true });
  });

  test('checks the current answer on press out', () => {
    const wordCardUIDispatch = jest.fn();
    const { currentCard } = mockDeckState();

    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        selectedArticle: 'The',
        selectedWord: 'coffee',
      },
      wordCardUIDispatch,
    });

    const { getByText } = render(<WordCardButton>Check</WordCardButton>);

    /**
     * The component checks on press out.
     * Press in is just the little fake button squish.
     */
    fireEvent(getByText('Check'), 'pressOut');

    expect(wordCardUIDispatch).toHaveBeenCalledWith({
      type: 'CHECK_ANSWER',
      currentCard,
    });
  });

  test('increments score and fires success haptics after a correct answer', () => {
    const cardDeckDispatch = jest.fn();
    mockDeckState(cardDeckDispatch);


    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        stage: 'CORRECT',
        progress: 'SUCCESS',
        feedbackKey: 'CORRECT_SUCCESS_NONE',
        attempts: 1,
      },
      wordCardUIDispatch: jest.fn(),
    });

    render(<WordCardButton>Next card</WordCardButton>);

    /**
     * Make sure setting the card state called the action
     */
    expect(cardDeckDispatch).toHaveBeenCalledWith({
      type: 'INCREMENT_WORD_SCORE',
    });

    /**
     * Make sure the haptic went off!
     */
    expect(mockNotificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });
});
