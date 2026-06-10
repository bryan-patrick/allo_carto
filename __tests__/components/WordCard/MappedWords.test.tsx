import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import {
  makeMockCardDeck,
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
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
      cardDeckDispatch: jest.fn(),
      currentCard,
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
