import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
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
    mockUseCardDeck.mockReturnValue({
      cardDeckState: {
        currentIndex: 0,
        currentId: 'word_noun_cafe',
        cardDeck: {
          title: 'Testing deck',
          CEFR: ['A1'],
          description: 'A deck for tests',
          image: undefined,
          wordIds: ['word_noun_cafe'],
          words: [],
        },
      },
      cardDeckDispatch: jest.fn(),
      currentCard: {
        id: 'word_noun_cafe',
        frenchWord: 'cafe',
        englishWords: ['coffee'],
        pronunciation: 'ka-fay',
        isVulgar: false,
        CEFR: 'A1',
        userScore: 14,
      },
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
