import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCardBack from '@/src/components/WordCard/WordCardBack';
import WordCardHeader from '@/src/components/WordCard/WordCardHeader';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { render } from '@testing-library/react-native';

/**
 * Mock the context hook wrappers and the actual word card. 
 * Hope that's not too confusing.
 */
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');
jest.mock('@/src/components/WordCard/WordCardHeader', () => {
  const { Text } = jest.requireActual('react-native');
  return jest.fn(() => <Text>Word card header</Text>)
});

/**
 * Yay syntax
 */
const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockWordCardHeader = jest.mocked(WordCardHeader);

/**
 * Render the back
 */
describe('<WordCardBack />', () => {
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
          image: undefined,
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

  test('renders the back of the current card', () => {
    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        stage: 'CORRECT',
        progress: 'SUCCESS',
        feedbackKey: 'CORRECT_SUCCESS_NONE',
      },
      wordCardUIDispatch: jest.fn(),
    });

    const { getByText } = render(
      <WordCardBack
        wordCardBackFlippedStyle={{}}
        feedbackStyle={{}}
        articleSlotStyle={{}}
        wordSlotStyle={{}}
      />,
    );

    /**
     * Make sure the text renders duh
     */
    getByText('le cafe');
    getByText('(ka-fay)');
    getByText('The');
    getByText('coffee');
    getByText('Correct! Great Job!');

    expect(mockWordCardHeader).toHaveBeenCalledWith({}, undefined);
  });
});
