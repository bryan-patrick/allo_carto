import MappedWords from '@/src/components/WordCard/MappedWords';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import WordCardSelection from '@/src/components/WordCard/WordCardSelection';
import { render } from '@testing-library/react-native';

/**
 * Mock the thing this component renders twice
 */
jest.mock('@/src/components/WordCard/MappedWords', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => <Text>Mapped words</Text>);
});

/**
 * Mock the context hook wrapper
 */
jest.mock('@/src/components/WordCard/useWordCardUI');

/**
 * Here we go again
 */
const mockMappedWords = jest.mocked(MappedWords);
const mockUseWordCardUI = jest.mocked(useWordCardUI);

/**
 * Test WordCardSelection
 */
describe('<WordCardSelection />', () => {
  beforeEach(() => {
    mockMappedWords.mockClear();
    mockUseWordCardUI.mockReset();
  });

  test('renders article and word choices with dispatch handlers', () => {
    const wordCardUIDispatch = jest.fn();

    mockUseWordCardUI.mockReturnValue({
      cardState: {
        ...initialWordCardState,
        selectedArticle: 'The',
        selectedWord: 'coffee',
      },
      wordCardUIDispatch,
    });

    render(
      <WordCardSelection
        articleWords={['The', 'A']}
        fillerWords={['coffee', 'tea']}
      />,
    );

    /**
     * First call is articles
     */
    expect(mockMappedWords).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        words: ['The', 'A'],
        activeWord: 'The',
      }),
      undefined,
    );

    /**
     * Second call is words
     */
    expect(mockMappedWords).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        words: ['coffee', 'tea'],
        activeWord: 'coffee',
      }),
      undefined,
    );

    const articleHandler = mockMappedWords.mock.calls[0][0].handler;
    const wordHandler = mockMappedWords.mock.calls[1][0].handler;

    /**
     * Make sure the fake handlers dispatch
     */
    articleHandler('A');
    wordHandler('tea');

    expect(wordCardUIDispatch).toHaveBeenCalledWith({
      type: 'SELECT_ARTICLE',
      word: 'A',
    });
    expect(wordCardUIDispatch).toHaveBeenCalledWith({
      type: 'SELECT_WORD',
      word: 'tea',
    });
  });
});
