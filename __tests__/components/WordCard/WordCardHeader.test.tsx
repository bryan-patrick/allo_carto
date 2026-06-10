import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import {
  makeMockCardDeck,
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import WordCardHeader from '@/src/components/WordCard/WordCardHeader';
import WordRank from '@/src/components/WordRank';
import { render } from '@testing-library/react-native';

/**
 * Mock the deck hook
 */
jest.mock('@/src/components/CardDeck/useCardDeck');

/**
 * Mock WordRank because we're not testing WordRank
 */
jest.mock('@/src/components/WordRank', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word rank</Text>);
});

/**
 * So glad this pattern exists. Such wow.
 */
const mockUseCardDeck = jest.mocked(useCardDeck);
const mockWordRank = jest.mocked(WordRank);

/**
 * Test the header
 */
describe('<WordCardHeader />', () => {
  beforeEach(() => {
    mockWordRank.mockClear();
    const currentCard: Word = {
      id: 'word_noun_cafe',
      frenchWord: 'cafe',
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
      cardDeckDispatch: jest.fn(),
      currentCard,
    });
  });

  /**
   * Make sure the CEFR and rank render
   */
  test('renders the current card level and word rank', () => {
    const { getByText } = render(<WordCardHeader />);

    /**
     * Does the header render the card level?
     */
    getByText('A1');

    expect(mockWordRank).toHaveBeenCalledWith({}, undefined);
  });
});
