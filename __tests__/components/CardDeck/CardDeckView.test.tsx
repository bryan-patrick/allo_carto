import CardDeckView from '@/src/components/Views/CardDeckView';
import { Word } from '@/src/components/CardDeck/cardDeckTypes';
import DeckProgress from '@/src/components/WordCard/DeckProgress';
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

jest.mock('@/src/components/WordCard/DeckProgress', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => {
    return <Text>Deck progress</Text>;
  });
});

/**
 * The child CardDeckView renders 
 */
const mockWordCardContainer = jest.mocked(WordCardContainer);
const mockDeckProgress = jest.mocked(DeckProgress);

describe('<CardDeckView />', () => {
  beforeEach(() => {
    mockWordCardContainer.mockClear();
    mockDeckProgress.mockClear();
  });

  test('renders the current card in a keyed WordCardContainer', async () => {
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
     * Now we can assert what it hands to its child.
     */
    await render(<CardDeckView currentCard={currentCard} />);

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
    expect(mockDeckProgress).toHaveBeenCalledWith({}, undefined);
  });
});
