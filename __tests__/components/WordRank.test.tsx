import { initialCardDeckState } from '@/src/components/CardDeck/cardDeckContext';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordRank, { RankIcon } from '@/src/components/WordRank';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { render } from '@testing-library/react-native';


/**
 * Icon name text mock because these can load late async.
*/
jest.mock('@expo/vector-icons/MaterialIcons', () => jest.fn(() => null));
jest.mock('@/src/components/CardDeck/useCardDeck');

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockMaterialIcon = jest.mocked(MaterialIcons);

describe('<WordRank />', () => {
  /**
   * Start with a currentCard mock
   */
  beforeEach(() => {
    mockMaterialIcon.mockClear();
    mockUseCardDeck.mockReturnValue({
      cardDeckState: initialCardDeckState,
      cardDeckDispatch: jest.fn(),
      currentCard: {
        id: 'word_noun_cafe',
        frenchWord: 'cafe',
        englishWords: ['coffee'],
        pronunciation: 'ka-fay',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 14,
      },
    });
  });

  /**
   * Look for current and next scores
   */
  test('renders the current score and next score', () => {
    const { getByText } = render(<WordRank />);

    getByText('14');
    getByText('15');
  });

  /**
   * Make sure the next icon also renders
   * diamond is the name of the MUI icon
   */
  test('renders the rank icon for a score', () => {
    render(<RankIcon score={15} />);

    expect(mockMaterialIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'diamond' }),
      undefined,
    );
  });

  test('renders the rank icon for a rank name', () => {
    render(<RankIcon rank="silver" />);

    expect(mockMaterialIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'military-tech' }),
      undefined,
    );
  });
});
