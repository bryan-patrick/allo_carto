import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckResultsView from '@/src/components/DeckResults/DeckResultsView';
import { useLinkProps } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';
import { ImageBackground } from 'react-native';

const mockLinkPress = jest.fn();

/**
 * Mock the deck hook
 */
jest.mock('@/src/components/CardDeck/useCardDeck');

/**
 * Mock navigation so we can check the link press.
 */
jest.mock('@react-navigation/native', () => ({
  useLinkProps: jest.fn(() => ({
    onPress: mockLinkPress,
  })),
}));

/**
 * Mock audio since our button boops
 */
jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({
    volume: 0,
    seekTo: jest.fn(),
    play: jest.fn(),
  })),
}));

/**
 * Mock icons
 */
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(({ name }) => <Text>{name}</Text>);
});

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseLinkProps = jest.mocked(useLinkProps);
const testingImage = { uri: 'testing-deck-image.jpg' };

/**
 * Testing deck results view
 */
describe('<DeckResultsView />', () => {
  beforeEach(() => {
    mockLinkPress.mockClear();
    mockUseLinkProps.mockClear();
    mockUseCardDeck.mockReturnValue({
      cardDeckState: {
        currentIndex: 0,
        currentId: 'word_noun_cafe',
        cardDeck: {
          title: 'Testing Coffee Deck',
          CEFR: ['A1'],
          description: 'A deck for tests',
          image: testingImage,
          wordIds: [
            'word_noun_cafe',
            'word_noun_the',
          ],
          words: [
            {
              id: 'word_noun_cafe',
              frenchWord: 'cafe',
              englishWords: ['coffee'],
              pronunciation: 'ka-fay',
              isVulgar: false,
              CEFR: 'A1',
              userScore: 1,
            },
            {
              id: 'word_noun_the',
              frenchWord: 'the',
              englishWords: ['tea'],
              pronunciation: 'tay',
              isVulgar: false,
              CEFR: 'A1',
              userScore: 0,
            },
          ],
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
        userScore: 1,
      },
    });
  });

  /**
   * Make sure the results render
   */
  test('renders the deck details and correct and incorrect words', () => {
    const { UNSAFE_getByType, getByText } = render(<DeckResultsView />);

    /**
     * Make sure the title row is rendering the selected deck.
     */
    getByText('Good job! You completed a ');
    getByText('Testing Coffee Deck');
    getByText(' deck.');

    /**
     * Make sure the image source is the selected deck image.
     */
    expect(UNSAFE_getByType(ImageBackground).props.source).toBe(testingImage);

    /**
     * Make sure correct words render in the correct section.
     */
    getByText('Correct');
    getByText('cafe');
    getByText('coffee');

    /**
     * Make sure incorrect words render in the incorrect section.
     */
    getByText('Incorrect');
    getByText('the');
    getByText('tea');
  });

  /**
   * Make sure the finish button goes home
   */
  test('routes back to the tabs home when pressing finish', () => {
    const { getByText } = render(<DeckResultsView />);

    /**
     * Pressing the finish link should use the navigation link props.
     */
    fireEvent.press(getByText('Finish'));
    expect(mockLinkPress).toHaveBeenCalled();

    /**
     * When the results page renders its the Finish 
     * button, make sure that button will route to (tabs).
     */
    expect(mockUseLinkProps).toHaveBeenCalledWith(
      expect.objectContaining({
        screen: '(tabs)',
      }),
    );
  });
});
