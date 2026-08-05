import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import {
  makeMockCardDeck,
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import WordCardButton from '@/src/components/WordCard/WordCardButton';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import {
  impactAsync,
  ImpactFeedbackStyle,
  notificationAsync,
} from 'expo-haptics';

/**
 * Mock all the things
 */
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));
jest.mock('@/src/db/useUserProgress');
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockImpactAsync = jest.mocked(impactAsync);
const mockNotificationAsync = jest.mocked(notificationAsync);
const mockUseUserProgress = jest.mocked(useUserProgress);
const mockRecordCorrectAnswer = jest.fn();

/**
 * Mock state
 */
function mockDeckState(cardDeckDispatch = jest.fn()) {
  const currentCard: Word = {
    id: 'word_noun_cafe',
    frenchWord: 'cafe',
    englishArticle: 'The',
    englishWords: ['coffee'],
    pronunciation: 'ka-fay',
    isVulgar: false,
    CEFR: 'A1',
    correctCount: 14,
  };

  mockUseCardDeck.mockReturnValue({
    cardDeckState: makeMockCardDeckState({
      currentIndex: 0,
      currentId: currentCard.id,
      cardDeck: makeMockCardDeck({ words: [currentCard] }),
    }),
    cardDeckDispatch,
    currentCard,
  });

  return { cardDeckDispatch, currentCard };
}

describe('<WordCardButton />', () => {
  beforeEach(() => {
    mockImpactAsync.mockClear();
    mockNotificationAsync.mockClear();
    mockRecordCorrectAnswer.mockReset();
    mockRecordCorrectAnswer.mockResolvedValue(true);
    mockUseUserProgress.mockReturnValue({
      isUpdatingProgress: false,
      progressById: {},
      recordCorrectAnswer: mockRecordCorrectAnswer,
      recordWordSeen: jest.fn(),
      refreshProgress: jest.fn(),
      status: 'ready',
    });
    mockUseCardDeck.mockReset();
    mockUseWordCardUI.mockReset();
  });

  test('disables itself until the answer has been selected', async () => {
    mockDeckState();
    mockUseWordCardUI.mockReturnValue({
      cardState: initialWordCardState,
      wordCardUIDispatch: jest.fn(),
    });

    const { getByTestId } = await render(
      <WordCardButton testID="word-card-button">Check</WordCardButton>,
    );

    /**
     * No selected article or selected word
     */
    expect(getByTestId('word-card-button')).toBeDisabled();
  });

  test('checks the current answer on press in', async () => {
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

    const { getByText } = await render(<WordCardButton>Check</WordCardButton>);

    /**
     * The component checks on press in.
     */
    await fireEvent(getByText('Check'), 'pressIn');

    expect(wordCardUIDispatch).toHaveBeenCalledWith({
      type: 'CHECK_ANSWER',
      currentCard,
    });
  });

  test('cannot check an answer while another progress write is running', async () => {
    const wordCardUIDispatch = jest.fn();
    mockDeckState();
    mockUseUserProgress.mockReturnValue({
      isUpdatingProgress: true,
      progressById: {},
      recordCorrectAnswer: mockRecordCorrectAnswer,
      recordWordSeen: jest.fn(),
      refreshProgress: jest.fn(),
      status: 'ready',
    });
    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        selectedArticle: 'The',
        selectedWord: 'coffee',
      },
      wordCardUIDispatch,
    });

    const { getByTestId } = await render(
      <WordCardButton testID="word-card-button">Check</WordCardButton>,
    );

    expect(getByTestId('word-card-button')).toBeDisabled();
    await fireEvent(getByTestId('word-card-button'), 'pressIn');
    expect(wordCardUIDispatch).not.toHaveBeenCalled();
  });

  test('reserves space for the next-card arrow before it appears', async () => {
    mockDeckState();
    mockUseWordCardUI.mockReturnValue({
      cardState: initialWordCardState,
      wordCardUIDispatch: jest.fn(),
    });

    const { getByTestId } = await render(<WordCardButton>Check</WordCardButton>);
    const textRowStyle = StyleSheet.flatten(
      getByTestId('word-card-button-content').props.style,
    );

    expect(textRowStyle.minHeight).toBe(24);
  });

  test('increments score and fires success haptics after a correct answer', async () => {
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

    await render(<WordCardButton>Next card</WordCardButton>);

    /**
     * Make sure setting the card state called the action
     */
    await waitFor(() => {
      expect(mockRecordCorrectAnswer).toHaveBeenCalledWith('word_noun_cafe');
      expect(cardDeckDispatch).toHaveBeenCalledWith({
        type: 'INCREMENT_WORD_SCORE',
      });
    });

    /**
     * Make sure the haptic went off!
     */
    expect(mockImpactAsync).toHaveBeenCalledWith(
      ImpactFeedbackStyle.Light,
    );
  });
});
