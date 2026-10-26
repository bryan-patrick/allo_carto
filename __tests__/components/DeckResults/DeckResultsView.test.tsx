import { storyAtlas } from '@/data/french/storyAtlas';
import { initialWordState } from '@/src/components/CardDeck/cardDeckTypes';
import { makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckResultsView from '@/src/components/Views/DeckResultsView';
import { fireEvent, render } from '@testing-library/react-native';

const mockRouter = {
	dismissTo: jest.fn(),
	replace: jest.fn(),
};

jest.mock('@/src/components/CardDeck/useCardDeck');

jest.mock('@/src/db/interface', () => ({
	getDeck: jest.fn(),
}));

jest.mock('@/src/db/useUserContext', () => ({
	useUserContext: () => ({ id: 'user_one' }),
}));

jest.mock('@/src/settings/useAppSettings', () => ({
	useAppSettings: () => ({
		settings: jest.requireActual('@/src/settings/appSettings').defaultAppSettings,
	}),
}));

jest.mock('expo-router', () => ({
	useFocusEffect: jest.fn(),
	useRouter: () => mockRouter,
}));

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-audio', () => ({
	useAudioPlayer: jest.fn(() => ({
		volume: 0,
		seekTo: jest.fn(),
		play: jest.fn(),
		pause: jest.fn(),
		addListener: jest.fn(() => ({ remove: jest.fn() })),
	})),
}));

const mockUseCardDeck = jest.mocked(useCardDeck);
const story = storyAtlas.stories.find(story =>
	story.chapters.some(chapter => chapter.decks.length > 0),
)!;
const chapter = story.chapters.find(chapter => chapter.decks.length > 0)!;

describe('<DeckResultsView />', () => {
	beforeEach(() => {
		mockRouter.dismissTo.mockClear();
		mockUseCardDeck.mockReturnValue({
			cardDeckState: makeMockCardDeckState({
				cardDeck: chapter.decks[0],
				isComplete: true,
				session: {
					id: 'completed-session',
					xpBefore: 0,
					/**
					 * Real sessions keep these lists to find newly available unlocks.
					 */
					unlockedIdsBefore: [],
					readyToUnlockIdsBefore: [],
					results: [],
					completion: { bonuses: [{ kind: 'completion', xp: 50 }], totalXP: 50, earnedInk: 0 },
				},
			}),
			cardDeckDispatch: jest.fn(),
			currentCard: initialWordState,
		});
	});

	test('returns to the selected chapter directly from the session summary', async () => {
		const { getByText, queryByText } = await render(<DeckResultsView />);

		expect(getByText('Session complete!')).toBeTruthy();
		expect(getByText('XP earned')).toBeTruthy();
		expect(queryByText('Next')).toBeNull();
		await fireEvent.press(getByText('Back to chapter'));
		expect(mockRouter.dismissTo).toHaveBeenCalledWith({
			pathname: '/ChapterDetail',
			params: {
				chapterId: chapter.id,
			},
		});
	});
});
