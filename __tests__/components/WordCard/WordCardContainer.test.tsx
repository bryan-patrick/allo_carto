import { makeMockCardDeck, makeMockCardDeckState, mockWords } from '@/src/components/CardDeck/mockCardDeck';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCard from '@/src/components/WordCard/WordCard';
import WordCardContainer from '@/src/components/WordCard/WordCardContainer';
import WordCardSelection from '@/src/components/WordCard/WordCardSelection';
import getFillerWords from '@/src/util/getFillerWords';
import { render, waitFor } from '@testing-library/react-native';

/**
 * Mock the util
 */
jest.mock('@/src/util/getFillerWords');
jest.mock('@/src/components/CardDeck/useCardDeck');

/**
 * Mock the children it is supposed to render
 */
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
const mockUseCardDeck = jest.mocked(useCardDeck);
const mockWordCard = jest.mocked(WordCard);
const mockWordCardSelection = jest.mocked(WordCardSelection);

/**
 * Test the WordCardContainer component
 */
describe('<WordCardContainer />', () => {
  beforeEach(() => {
    mockGetFillerWords.mockReset();
    mockWordCard.mockClear();
    mockWordCardSelection.mockClear();

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

  test('renders the word card pieces', async () => {
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

    const { getByText, rerender } = render(
      <WordCardContainer
        word={word}
        isCurrent={true}
      />,
    );

    /**
     * Make sure the container rendered its children
     */
    getByText('Word card');
    getByText('Word card selection');
    getByText('Check');

    /**
     * Make sure the current card isCurrent
     */
    expect(mockWordCard).toHaveBeenCalledWith(
      expect.objectContaining({
        isCurrent: true,
      }),
      undefined,
    );

    /**
     * This is for loadWords() in the useEffect
     */
    await waitFor(() => {
      expect(mockGetFillerWords).toHaveBeenNthCalledWith(1, {
        correctWords: ['coffee'],
        words: ['dog', 'house', 'book', 'apple', 'train'],
      });

      expect(mockWordCardSelection).toHaveBeenLastCalledWith(
        expect.objectContaining({
          articleWords: ['The', 'A'],
          fillerWords: ['coffee', 'tea'],
        }),
        undefined,
      );
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

    rerender(
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

    render(
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
});
