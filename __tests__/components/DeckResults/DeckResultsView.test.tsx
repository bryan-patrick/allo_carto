import { DeckDawnAtTheDropOff } from '@/data/french/decks';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import { makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckResultsView from '@/src/components/Views/DeckResultsView';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useLinkProps } from 'expo-router/react-navigation';

jest.mock('@/src/components/CardDeck/useCardDeck');

jest.mock('expo-router/react-navigation', () => ({
	useLinkProps: jest.fn(() => ({})),
}));

jest.mock('expo-router', () => ({
	router: {
		dismissTo: jest.fn(),
		replace: jest.fn(),
	},
}));

jest.mock('expo-audio', () => ({
	useAudioPlayer: jest.fn(() => ({
		volume: 0,
		seekTo: jest.fn(),
		play: jest.fn(),
	})),
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => {
	const { Text } = jest.requireActual('react-native');

	return jest.fn(({ name }) => <Text>{name}</Text>);
});

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseLinkProps = jest.mocked(useLinkProps);
const mockRouterDismissTo = jest.mocked(router.dismissTo);
describe('<DeckResultsView />', () => {
	beforeEach(() => {
		mockRouterDismissTo.mockClear();
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
			...DeckDawnAtTheDropOff,
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

	test('renders the deck details and correct and incorrect words', async () => {
		const { getByText, getAllByText } = await render(<DeckResultsView />);

		getAllByText(DeckDawnAtTheDropOff.title);

		getByText('Correct');
		getByText('cafe');
		getByText('coffee');

		getByText('Incorrect');
		getByText('the');
		getByText('tea');
	});

	test('dismisses results back to the selected place deck list when pressing finish', async () => {
		const { getByText } = await render(<DeckResultsView />);

		await fireEvent.press(getByText('Finish'));
		expect(mockRouterDismissTo).toHaveBeenCalledWith({
			pathname: '/CardDeckSelect',
			params: { placeId: 'aeroport-oiseau' },
		});
	});
});
