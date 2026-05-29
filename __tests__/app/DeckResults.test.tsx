import DeckResults from '@/src/app/(routes)/DeckResults';
import DeckResultsView from '@/src/components/DeckResults/DeckResultsView';
import { render } from '@testing-library/react-native';

/**
 * Mock the child results view
 */
jest.mock('@/src/components/DeckResults/DeckResultsView', () => {
  const { Text } = jest.requireActual('react-native');

  return jest.fn(() => {
    return <Text>Deck results view</Text>;
  });
});

const mockDeckResultsView = jest.mocked(DeckResultsView);

/**
 * Route parent test
 */
describe('<DeckResults />', () => {
  beforeEach(() => {
    mockDeckResultsView.mockClear();
  });

  /**
   * Make sure the route renders the view
   */
  test('renders the deck results view', () => {
    const { getByText } = render(<DeckResults />);

    /**
     * The route parent should hand off to the actual results view.
     */
    getByText('Deck results view');
    expect(mockDeckResultsView).toHaveBeenCalledWith({}, undefined);
  });
});
