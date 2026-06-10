import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import {
  makeMockCardDeck,
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
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
    const currentCard: Word = {
      id: 'word_noun_cafe',
      frenchWord: 'cafe',
      frenchArticle: 'le',
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
      cardDeckDispatch: jest.fn(),
      currentCard,
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
