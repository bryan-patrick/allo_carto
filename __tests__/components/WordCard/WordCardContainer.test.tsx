import { makeMockCardDeck, makeMockCardDeckState, mockWords } from '@/src/components/CardDeck/mockCardDeck';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCardContainer from '@/src/components/WordCard/WordCardContainer';
import { useUserProgress } from '@/src/db/useUserProgress';
import getFillerWords from '@/src/util/getFillerWords';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('@/src/util/getFillerWords');
jest.mock('@/src/db/useUserProgress');
jest.mock('@/src/components/CardDeck/useCardDeck');

jest.mock('@/src/components/WordCard/WordCard', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word card</Text>);
});

jest.mock('@/src/components/WordCard/WordCardSelection', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word card selection</Text>);
});

jest.mock('@/src/components/WordCard/WordCardButton', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(({ children }: { children: string }) => <Text>{children}</Text>);
});

const mockGetFillerWords = jest.mocked(getFillerWords);
const mockUseUserProgress = jest.mocked(useUserProgress);
const mockRecordWordSeen = jest.fn();
const mockUseCardDeck = jest.mocked(useCardDeck);

describe('<WordCardContainer />', () => {
  beforeEach(() => {
    mockGetFillerWords.mockReset();
    mockRecordWordSeen.mockReset();
    mockRecordWordSeen.mockResolvedValue(true);
    mockUseUserProgress.mockReturnValue({
      isUpdatingProgress: false,
      progressById: {},
      recordCorrectAnswer: jest.fn(),
      recordWordSeen: mockRecordWordSeen,
      refreshProgress: jest.fn(),
      status: 'ready',
    });
    const adjective = {
      ...mockWords[0],
      id: 'word_adjective_rapide',
      frenchWord: 'rapide',
      englishWords: ['fast'],
      partOfSpeech: 'adjective',
    };
    const extraNoun = {
      ...mockWords[0],
      id: 'word_noun_train',
      frenchWord: 'train',
      englishWords: ['train'],
    };
    const wholeDeck = makeMockCardDeck({
      words: [...mockWords, adjective, extraNoun],
    });
    const cardDeck = makeMockCardDeck({
      words: mockWords,
      wordChoices: wholeDeck.wordChoices,
    });

    mockUseCardDeck.mockReturnValue({
      cardDeckState: makeMockCardDeckState({ cardDeck }),
      cardDeckDispatch: jest.fn(),
      currentCard: cardDeck.words[0],
    });
  });

  /**
   * Recording an answer updates word scores. That rerender must not move
   * the answer buttons while the learner is still looking at the card.
   */
  test('does not reshuffle choices when progress changes', async () => {
    mockGetFillerWords
      .mockResolvedValueOnce(['coffee', 'tea'])
      .mockResolvedValueOnce(['The', 'A']);

    const word: Word = {
      id: 'word_noun_cafe',
      frenchWord: 'cafe',
      frenchArticle: 'le',
      englishArticle: 'The',
      englishWords: ['coffee'],
      pronunciation: 'ka-fay',
      isVulgar: false,
      CEFR: 'A1',
      partOfSpeech: 'noun',
      correctCount: 14,
    };

    const { rerender } = await render(
      <WordCardContainer
        word={word}
        isCurrent={true}
      />,
    );

    await waitFor(() => {
      expect(mockGetFillerWords).toHaveBeenNthCalledWith(1, {
        correctWords: ['coffee'],
        words: ['dog', 'house', 'book', 'apple', 'train'],
      });
    });

    const updatedWords = mockWords.map(deckWord => ({
      ...deckWord,
      correctCount: deckWord.correctCount + 1,
    }));
    const updatedCardDeck = makeMockCardDeck({ words: updatedWords });

    mockUseCardDeck.mockReturnValue({
      cardDeckState: makeMockCardDeckState({ cardDeck: updatedCardDeck }),
      cardDeckDispatch: jest.fn(),
      currentCard: updatedCardDeck.words[0],
    });

    await rerender(
      <WordCardContainer
        word={word}
        isCurrent={true}
      />,
    );

    expect(mockGetFillerWords).toHaveBeenCalledTimes(2);
  });

  test('falls back to the full deck when part-of-speech choices are too sparse', async () => {
    mockGetFillerWords
      .mockResolvedValueOnce(['how much', 'market', 'clue'])
      .mockResolvedValueOnce([]);

    const word: Word = {
      id: 'word_expression_combien',
      frenchWord: 'combien',
      englishWords: ['how much'],
      pronunciation: 'kohm-byen',
      isVulgar: false,
      CEFR: 'A1',
      partOfSpeech: 'expression',
      correctCount: 0,
    };
    const cardDeck = makeMockCardDeck({
      words: [word],
      wordChoices: [
        { englishWords: ['how much'], partOfSpeech: 'expression' },
        { englishWords: ['market'], partOfSpeech: 'noun' },
        { englishWords: ['clue'], partOfSpeech: 'noun' },
        { englishWords: ['hidden'], partOfSpeech: 'adjective' },
      ],
    });

    mockUseCardDeck.mockReturnValue({
      cardDeckState: makeMockCardDeckState({ cardDeck }),
      cardDeckDispatch: jest.fn(),
      currentCard: word,
    });

    await render(
      <WordCardContainer
        word={word}
        isCurrent={true}
      />,
    );

    await waitFor(() => {
      expect(mockGetFillerWords).toHaveBeenNthCalledWith(1, {
        correctWords: ['how much'],
        words: ['how much', 'market', 'clue', 'hidden'],
      });
    });
  });

  test('increments the seen count when the card is current', async () => {
    mockGetFillerWords
      .mockResolvedValueOnce(['coffee', 'tea'])
      .mockResolvedValueOnce(['The', 'A']);

    const word: Word = {
      id: 'word_noun_cafe',
      frenchWord: 'cafe',
      frenchArticle: 'le',
      englishArticle: 'The',
      englishWords: ['coffee'],
      pronunciation: 'ka-fay',
      isVulgar: false,
      CEFR: 'A1',
      partOfSpeech: 'noun',
      correctCount: 14,
    };

    await render(
      <WordCardContainer
        word={word}
        isCurrent={true}
      />,
    );

    await waitFor(() => {
      expect(mockRecordWordSeen).toHaveBeenCalledWith('word_noun_cafe');
    });
  });
});
