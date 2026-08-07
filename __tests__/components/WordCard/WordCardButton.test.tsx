import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import { makeMockCardDeck, makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordCardButton from '@/src/components/WordCard/WordCardButton';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { render, userEvent, waitFor } from '@testing-library/react-native';

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
jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);
const mockUseUserProgress = jest.mocked(useUserProgress);
const mockRecordCorrectAnswer = jest.fn();

function mockDeckState(cardDeckDispatch = jest.fn()) {
	const currentCard: Word = {
		id: 'word_noun_cafe',
		frenchWord: 'cafe',
		englishArticle: 'The',
		englishWords: ['coffee'],
		pronunciation: 'ka-fay',
		isVulgar: false,
		CEFR: 'A1',
		correctCount: 14,
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
		mockRecordCorrectAnswer.mockReset();
		mockRecordCorrectAnswer.mockResolvedValue(true);
		mockUseUserProgress.mockReturnValue({
			isUpdatingProgress: false,
			progressById: {},
			writeCorrectAnswer: mockRecordCorrectAnswer,
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
			isUpdatingProgress: true,
			progressById: {},
			writeCorrectAnswer: mockRecordCorrectAnswer,
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

	test('records a correct answer and increments its score', async () => {
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
	});
});
