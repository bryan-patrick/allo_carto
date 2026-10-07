import { storyAtlas } from '@/data/french/storyAtlas';
import { initialWordState } from '@/src/components/CardDeck/cardDeckTypes';
import { makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckResultsView from '@/src/components/Views/DeckResultsView';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

jest.mock('@/src/components/CardDeck/useCardDeck');

jest.mock('@/src/db/interface', () => ({ getDeck: jest.fn() }));

jest.mock('@/src/settings/useAppSettings', () => ({
	useAppSettings: () => ({ settings: { cardsPerDeck: null } }),
}));

jest.mock('expo-router/react-navigation', () => ({
	useLinkProps: jest.fn(() => ({})),
}));

jest.mock('expo-router', () => ({
	useFocusEffect: jest.fn(),
	router: {
		dismissTo: jest.fn(),
		replace: jest.fn(),
	},
}));

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-audio', () => ({
	useAudioPlayer: jest.fn(() => ({
		volume: 0,
		seekTo: jest.fn(),
		play: jest.fn(),
	})),
}));

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockRouterDismissTo = jest.mocked(router.dismissTo);
const story = storyAtlas.stories.find(story =>
	story.chapters.some(chapter => chapter.decks.length > 0),
)!;
const chapter = story.chapters.find(chapter => chapter.decks.length > 0)!;

describe('<DeckResultsView />', () => {
	beforeEach(() => {
		mockRouterDismissTo.mockClear();
		mockUseCardDeck.mockReturnValue({
			cardDeckState: makeMockCardDeckState({
				cardDeck: chapter.decks[0],
				isComplete: true,
				session: {
					id: 'completed-session',
					xpBefore: 0,
					results: [],
					completion: { bonuses: [{ kind: 'completion', xp: 50 }], totalXP: 50 },
				},
			}),
			cardDeckDispatch: jest.fn(),
			currentCard: initialWordState,
		});
	});

	test('dismisses results back to the selected chapter and reopens its deck picker', async () => {
		const { getByText } = await render(<DeckResultsView />);

		await fireEvent.press(getByText('Next'));
		await fireEvent.press(getByText('Next'));
		await fireEvent.press(getByText('Finish'));
		expect(mockRouterDismissTo).toHaveBeenCalledWith({
			pathname: '/ChapterSelect',
			params: {
				chapterId: chapter.id,
				deckPickerRequest: expect.any(String),
				storyId: story.id,
			},
		});
	});
});
