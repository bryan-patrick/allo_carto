import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import MappedWords from '@/src/components/WordCard/MappedWords';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { fireEvent, render } from '@testing-library/react-native';

/**
 * Mock the hooks
 */
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');
const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);

/**
 * Test buttons you press to insert your word(s) answer into the slots
 */
describe('<MappedWords />', () => {
  beforeEach(() => {
    mockUseCardDeck.mockReturnValue({
      cardDeckState: {
        currentIndex: 0,
        currentId: 'word_noun_cafe',
        cardDeck: {
          title: 'Testing deck',
          description: 'A deck for tests',
          CEFR: ['A1'],
          wordIds: ['word_noun_cafe'],
          image: undefined,
          words: [],
        },
      },
      cardDeckDispatch: jest.fn(),
      currentCard: {
        id: 'word_noun_cafe',
        frenchWord: 'cafe',
        englishArticle: 'The',
        englishWords: ['coffee'],
        pronunciation: 'ka-fay',
        isVulgar: false,
        CEFR: 'A1',
        userScore: 14,
      },
    });

    /**
     * Set up a UseWordCardUI for each test
     */
    mockUseWordCardUI.mockReturnValue({
      cardState: initialWordCardState,
      wordCardUIDispatch: jest.fn(),
    });
  });

  /**
   * Test a press
   */
  test('renders words and calls the handler with the pressed word', () => {
    const handler = jest.fn();
    const { getByText } = render(
      <MappedWords
        words={['coffee', 'tea']}
        activeWord="coffee"
        handler={handler}
      />,
    );

    /**
     * The map maps. Much wow.
     */
    getByText('coffee');
    getByText('tea');
    fireEvent.press(getByText('tea'));
    expect(handler).toHaveBeenCalledWith('tea');
  });
});
