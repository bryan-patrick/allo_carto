import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCardFront from '@/src/components/WordCard/WordCardFront';
import WordCardHeader from '@/src/components/WordCard/WordCardHeader';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { render } from '@testing-library/react-native';

/**
 * Mock the context hook wrappers
 */
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');

/**
 * Mock the header, the front card expects to render it
 */
jest.mock('@/src/components/WordCard/WordCardHeader', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word card header</Text>);
});

/**
 * Yay
 */
const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockWordCardHeader = jest.mocked(WordCardHeader);

/**
 * Render the front
 */
describe('<WordCardFront />', () => {
  beforeEach(() => {
    mockWordCardHeader.mockClear();
    mockUseCardDeck.mockReturnValue({
      cardDeckState: {
        currentIndex: 0,
        currentId: 'word_noun_cafe',
        cardDeck: {
          title: 'Testing deck',
          description: 'A deck for tests',
          CEFR: ['A1'],
          wordIds: ['word_noun_cafe'],
          words: [],
        },
      },
      cardDeckDispatch: jest.fn(),
      currentCard: {
        id: 'word_noun_cafe',
        frenchWord: 'cafe',
        frenchArticle: 'le',
        englishArticle: 'The',
        englishWords: ['coffee'],
        pronunciation: 'ka-fay',
        isVulgar: false,
        CEFR: 'A1',
        userScore: 14,
      },
    });
  });

  /**
   * Test the text and selected answers
   */
  test('renders the front of the current card', () => {
    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        selectedArticle: 'A',
        selectedWord: 'tea',
        progress: 'WARNING',
        mistake: 'BOTH',
        feedbackKey: 'READY_WARNING_BOTH',
      },
      wordCardUIDispatch: jest.fn(),
    });

    const { getByText, getAllByText } = render(
      <WordCardFront
        handleWordWidth={jest.fn()}
        handleArticleWidth={jest.fn()}
        articleWidthStyle={{}}
        wordWidthStyle={{}}
        wordCardFrontFlippedStyle={{}}
        feedbackStyle={{}}
        articleSlotStyle={{}}
        wordSlotStyle={{}}
      />,
    );

    /**
     * Make sure the actual card text renders
     */
    getByText('le cafe');
    getByText('(ka-fay)');

    /**
     * Make sure the wrong answers render too
     */
    expect(getAllByText('A').length).toBeGreaterThan(0);
    expect(getAllByText('tea').length).toBeGreaterThan(0);

    /**
     * Make sure we get the feedback
     */
    getByText('Both are incorrect! Try again.');

    expect(mockWordCardHeader).toHaveBeenCalledWith({}, undefined);
  });
});
