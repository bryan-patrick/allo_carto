import { storyAtlas } from '@/data/french/storyAtlas';
import { initialWordState } from '@/src/components/CardDeck/cardDeckTypes';
import { makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckResultsView from '@/src/components/Views/DeckResultsView';
import { saveDeckPassageFeedback } from '@/src/db/interface';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

jest.mock('@/src/components/CardDeck/useCardDeck');

jest.mock('@/src/db/interface', () => ({
	getDeck: jest.fn(),
	getDB: jest.fn(async () => ({ getFirstAsync: jest.fn(async () => null) })),
	getWordProgressById: jest.fn(async () => ({})),
	saveDeckPassageFeedback: jest.fn(async () => {}),
}));

jest.mock('@/src/db/useUserContext', () => ({
	useUserContext: () => ({ id: 'user_one' }),
}));

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
		jest.mocked(saveDeckPassageFeedback).mockClear();
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

	test('saves passage feedback and dismisses results back to the selected chapter', async () => {
		const { getByText, getByLabelText } = await render(<DeckResultsView />);

		const yesLabel = 'Yes, the passage is easier to read';
		await waitFor(() => expect(getByLabelText(yesLabel)).toBeEnabled());
		await fireEvent.press(getByLabelText(yesLabel));
		await waitFor(() => expect(getByText('Word results')).toBeTruthy());
		expect(saveDeckPassageFeedback).toHaveBeenCalledWith({
			userId: 'user_one',
			sessionId: 'completed-session',
			deckId: chapter.decks[0].id,
			isEasierToRead: true,
			results: [],
		});
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
