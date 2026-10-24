import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import { makeMockCardDeck, makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCardButton from '@/src/components/WordCard/WordCardButton';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { defaultAppSettings } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getUserExperience } from '@/src/util/userExperience';
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { useAudioPlayer } from 'expo-audio';

jest.mock('expo-audio', () => {
	const player = {
		volume: 1,
		seekTo: jest.fn(async () => {}),
		play: jest.fn(),
		pause: jest.fn(),
		addListener: jest.fn(() => ({ remove: jest.fn() })),
	};
	return { useAudioPlayer: jest.fn(() => player) };
});

jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn(),
	ImpactFeedbackStyle: {
		Light: 'light',
	},
	notificationAsync: jest.fn(),
	NotificationFeedbackType: {
		Success: 'success',
		Warning: 'warning',
		Error: 'error',
	},
}));

jest.mock('@/src/db/useUserProgress');
jest.mock('@/src/settings/useAppSettings');
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockUseUserProgress = jest.mocked(useUserProgress);
const mockUseAppSettings = jest.mocked(useAppSettings);
const mockRecordCorrectAnswer = jest.fn();

function mockDeckState(cardDeckDispatch = jest.fn()) {
	const currentCard: Word = {
		id: 'word_noun_cafe',
		frenchWord: 'cafe',
		englishArticle: 'The',
		englishWords: ['coffee'],
		pronunciation: 'ka-fay',
		ipaPronunciation: 'kafe',
		isVulgar: false,
		CEFR: 'A1',
		correctCount: 14,
		rarity: 'Common',
	};

	mockUseCardDeck.mockReturnValue({
		cardDeckState: makeMockCardDeckState({
			currentIndex: 0,
			currentId: currentCard.id,
			cardDeck: makeMockCardDeck({ words: [currentCard] }),
		}),
		cardDeckDispatch,
		currentCard,
	});

	return { cardDeckDispatch, currentCard };
}

describe('<WordCardButton />', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseAppSettings.mockReturnValue({
			settings: defaultAppSettings,
			setSetting: jest.fn(),
		});
		mockRecordCorrectAnswer.mockReset();
		mockRecordCorrectAnswer.mockResolvedValue({
			xp: 10,
			learningBonusXP: 0,
			previousProgress: 'mastered',
			nextProgress: 'mastered',
		});
		mockUseUserProgress.mockReturnValue({
			experience: getUserExperience(0),
			isUpdatingProgress: false,
			progressById: {},
			writeCorrectAnswer: mockRecordCorrectAnswer,
			writeDeckCompletion: jest.fn(),
			writeWordSeen: jest.fn(),
			reloadProgress: jest.fn(),
			status: 'ready',
		});
		mockUseCardDeck.mockReset();
		mockUseWordCardUI.mockReset();
	});

	test('disables itself until the answer has been selected', async () => {
		mockDeckState();
		mockUseWordCardUI.mockReturnValue({
			cardState: initialWordCardState,
			wordCardUIDispatch: jest.fn(),
		});

		const { getByTestId } = await render(
			<WordCardButton testID="word-card-button">Check</WordCardButton>,
		);

		expect(getByTestId('word-card-button')).toBeDisabled();
	});

	test('checks the current answer when pressed', async () => {
		const wordCardUIDispatch = jest.fn();
		const { currentCard } = mockDeckState();
		const user = userEvent.setup();

		mockUseWordCardUI.mockReturnValue({
			cardState: {
				...initialWordCardState,
				selectedArticle: 'The',
				selectedWord: 'coffee',
			},
			wordCardUIDispatch,
		});

		const { getByText } = await render(<WordCardButton>Check</WordCardButton>);

		await user.press(getByText('Check'));

		expect(wordCardUIDispatch).toHaveBeenCalledWith({
			type: 'CHECK_ANSWER',
			currentCard,
		});
	});

	test('cannot check an answer while another progress write is running', async () => {
		mockDeckState();
		mockUseUserProgress.mockReturnValue({
			experience: getUserExperience(0),
			isUpdatingProgress: true,
			progressById: {},
			writeCorrectAnswer: mockRecordCorrectAnswer,
			writeDeckCompletion: jest.fn(),
			writeWordSeen: jest.fn(),
			reloadProgress: jest.fn(),
			status: 'ready',
		});
		mockUseWordCardUI.mockReturnValue({
			cardState: {
				...initialWordCardState,
				selectedArticle: 'The',
				selectedWord: 'coffee',
			},
			wordCardUIDispatch: jest.fn(),
		});

		const { getByTestId } = await render(
			<WordCardButton testID="word-card-button">Check</WordCardButton>,
		);

		expect(getByTestId('word-card-button')).toBeDisabled();
	});

	test.each([true, false])(
		'records a correct answer without a sound effect (effects enabled: %s)',
		async enabled => {
			mockUseAppSettings.mockReturnValue({
				settings: { ...defaultAppSettings, soundEffectsEnabled: enabled },
				setSetting: jest.fn(),
			});
			const cardDeckDispatch = jest.fn();
			mockDeckState(cardDeckDispatch);

			mockUseWordCardUI.mockReturnValue({
				cardState: {
					...initialWordCardState,
					stage: 'CORRECT',
					progress: 'SUCCESS',
					feedbackKey: 'CORRECT_SUCCESS_NONE',
					attempts: 1,
				},
				wordCardUIDispatch: jest.fn(),
			});

			await render(<WordCardButton>Next card</WordCardButton>);

			await waitFor(() => {
				expect(mockRecordCorrectAnswer).toHaveBeenCalledWith('word_noun_cafe');
				expect(cardDeckDispatch).toHaveBeenCalledWith({
					type: 'INCREMENT_WORD_SCORE',
				});
			});

			const player = jest.mocked(useAudioPlayer).mock.results[0].value;
			expect(player.volume).toBe(0.4);
			expect(player.play).not.toHaveBeenCalled();
		},
	);
});
