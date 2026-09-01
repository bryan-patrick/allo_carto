import {
	makeMockCardDeck,
	makeMockCardDeckState,
	mockWords,
} from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import WordProgress from '@/src/components/WordProgress';
import { render } from '@testing-library/react-native';

jest.mock('@/src/components/CardDeck/useCardDeck');

const mockUseCardDeck = jest.mocked(useCardDeck);

async function showWordProgress(correctCount: number, seenCount: number) {
	const currentCard = {
		...mockWords[0],
		correctCount,
		seenCount,
	};
	const cardDeck = makeMockCardDeck({ words: [currentCard] });
	const cardDeckState = makeMockCardDeckState({
		cardDeck,
	});

	mockUseCardDeck.mockReturnValue({
		cardDeckState,
		cardDeckDispatch: jest.fn(),
		currentCard,
	});

	return await render(<WordProgress />);
}

describe('<WordProgress />', () => {
	test('shows the Unseen rank and question mark icon for an unseen card', async () => {
		const { getByText } = await showWordProgress(0, 0);

		getByText('Unseen');
		getByText('question_mark');
	});

	test('shows the New rank for a seen card with no correct answers', async () => {
		const { getAllByText, queryByText } = await showWordProgress(0, 1);

		expect(getAllByText('New')).toHaveLength(2);
		expect(getAllByText('fiber_new')).toHaveLength(2);
		expect(queryByText('Unseen')).toBeNull();
	});
});
