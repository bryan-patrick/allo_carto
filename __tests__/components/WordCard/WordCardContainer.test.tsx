import WordCard from '@/src/components/WordCard/WordCard';
import WordCardContainer from '@/src/components/WordCard/WordCardContainer';
import WordCardSelection from '@/src/components/WordCard/WordCardSelection';
import getFillerWords from '@/src/util/getFillerWords';
import { render, waitFor } from '@testing-library/react-native';

/**
 * Mock the util
 */
jest.mock('@/src/util/getFillerWords');

/**
 * Mock the children it is supposed to render
 */
jest.mock('@/src/components/WordCard/WordCard', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word card</Text>);
});

jest.mock('@/src/components/WordCard/WordCardSelection', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Word card selection</Text>);
});

jest.mock('@/src/components/WordCard/WordCardButton', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(({ children }: { children: string }) => <Text>{children}</Text>);
});

const mockGetFillerWords = jest.mocked(getFillerWords);
const mockWordCard = jest.mocked(WordCard);
const mockWordCardSelection = jest.mocked(WordCardSelection);

/**
 * Test the WordCardContainer component
 */
describe('<WordCardContainer />', () => {
  beforeEach(() => {
    mockGetFillerWords.mockReset();
    mockWordCard.mockClear();
    mockWordCardSelection.mockClear();
  });

  test('renders the word card pieces', async () => {
    mockGetFillerWords
      .mockResolvedValueOnce(['coffee', 'tea'])
      .mockResolvedValueOnce(['The', 'A']);

    const word = {
      id: 'word_noun_cafe',
      frenchWord: 'cafe',
      frenchArticle: 'le',
      englishArticle: 'The',
      englishWords: ['coffee'],
      pronunciation: 'ka-fay',
      isVulgar: false,
      CEFR: 'A1' as const,
      correctCount: 14,
    };

    const { getByText } = render(
      <WordCardContainer
        word={word}
        isCurrent={true}
      />,
    );

    /**
     * Make sure the container rendered its children
     */
    getByText('Word card');
    getByText('Word card selection');
    getByText('Check');

    /**
     * Make sure the current card isCurrent
     */
    expect(mockWordCard).toHaveBeenCalledWith(
      expect.objectContaining({
        isCurrent: true,
      }),
      undefined,
    );

    /**
     * This is for loadWords() in the useEffect
     */
    await waitFor(() => {
      expect(mockWordCardSelection).toHaveBeenLastCalledWith(
        expect.objectContaining({
          articleWords: ['The', 'A'],
          fillerWords: ['coffee', 'tea'],
        }),
        undefined,
      );
    });
  });
});
