import CardDeckView from '@/src/components/CardDeck/CardDeckView';
import { Word } from '@/src/components/CardDeck/cardDeckTypes';
import WordCardContainer from '@/src/components/WordCard/WordCardContainer';
import { render } from '@testing-library/react-native';

/**
 * testing CardDeckView
 */
jest.mock('@/src/components/WordCard/WordCardContainer', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => {
    return <Text>Word card</Text>;
  });
});

/**
 * The child CardDeckView renders 
 */
const mockWordCardContainer = jest.mocked(WordCardContainer);

describe('<CardDeckView />', () => {
  beforeEach(() => {
    mockWordCardContainer.mockClear();
  });

  test('renders the current card in a keyed WordCardContainer', () => {
    /**
     * Je vuex un cafe sil te plait
     */
    const currentCard: Word = {
      id: 'word_noun_cafe',
      frenchWord: 'cafe',
      englishWords: ['coffee'],
      pronunciation: 'ka-fay',
      isVulgar: false,
      CEFR: 'A1',
      correctCount: 14,
    };

    /**
     * ...idk if this actually works to check for the key
     */
    const cardDeckView = CardDeckView({ currentCard });
    expect(cardDeckView.key).toBe(currentCard.id);

    /**
     * Now we can assert what it hands to its child.
     */
    render(<CardDeckView currentCard={currentCard} />);

    /**
     * CardDeckView should pass the current card through.
     * It should also say it is current, because what else would it be
     */
    expect(mockWordCardContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        word: currentCard,
        isCurrent: true,
      }),
      undefined,
    );
  });
});
