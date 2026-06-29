import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import {
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import DeckResultsView from '@/src/components/DeckResults/DeckResultsView';
import { DeckToTheGate } from '@/data/french/decks';
import { router } from 'expo-router';
import { useLinkProps } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';
import { ImageBackground } from 'react-native';

/**
 * Mock the deck hook
 */
jest.mock('@/src/components/CardDeck/useCardDeck');

/**
 * Mock navigation so we can check the link press.
 */
jest.mock('@react-navigation/native', () => ({
  useLinkProps: jest.fn(() => ({})),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
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
const mockRouterReplace = jest.mocked(router.replace);
const testingImage = { uri: 'testing-deck-image.jpg' };

/**
 * Testing deck results view
 */
describe('<DeckResultsView />', () => {
  beforeEach(() => {
    mockRouterReplace.mockClear();
    mockUseLinkProps.mockClear();
    const words: Word[] = [
      {
        id: 'word_noun_cafe',
        frenchWord: 'cafe',
        englishWords: ['coffee'],
        pronunciation: 'ka-fay',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 1,
      },
      {
        id: 'word_noun_the',
        frenchWord: 'the',
        englishWords: ['tea'],
        pronunciation: 'tay',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 0,
      },
    ];
    const cardDeck = {
      ...DeckToTheGate,
      image: testingImage,
      words,
    };

    mockUseCardDeck.mockReturnValue({
      cardDeckState: makeMockCardDeckState({
        currentIndex: 0,
        currentId: words[0].id,
        cardDeck,
        correctWords: [words[0]],
        incorrectWords: [words[1]],
      }),
      cardDeckDispatch: jest.fn(),
      currentCard: words[0],
    });
  });

  /**
   * Make sure the results render
   */
  test('renders the deck details and correct and incorrect words', () => {
    const { UNSAFE_getByType, getByText, getAllByText } = render(<DeckResultsView />);

    /**
     * Make sure the title row is rendering the selected deck.
     * Note the GradientText component renders the title twice 
     * (on purpose).
     */
    getByText('Good job! You completed a ');
    expect(getAllByText(DeckToTheGate.title)).toHaveLength(2);
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
   * Make sure the finish button goes back to deck select
   */
  test('replaces results with the selected place deck list when pressing finish', () => {
    const { getByText } = render(<DeckResultsView />);

    /**
     * Pressing the finish link should replace the route, so back does not
     * land on completed results again.
     */
    fireEvent(getByText('Finish'), 'pressIn');
    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/CardDeckSelect',
      params: { placeId: 'aeroport-oiseau' },
    });
  });
});
