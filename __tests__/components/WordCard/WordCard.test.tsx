import { CardDeckContext, initialCardDeckState } from '@/src/components/CardDeck/cardDeckContext';
import WordCard from '@/src/components/WordCard/WordCard';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { render, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

jest.mock('@/src/components/WordCard/useWordCardUI');

const mockRouter = {
	replace: jest.fn(),
};

jest.mock('expo-router', () => ({
	useRouter: () => mockRouter,
}));

jest.mock('@/src/components/WordCard/WordCardFront', () => {
	const { Text } = jest.requireActual('react-native');

	return jest.fn(() => <Text>Word card front</Text>);
});

jest.mock('@/src/components/WordCard/WordCardBack', () => {
	const { Text } = jest.requireActual('react-native');

	return jest.fn(() => {
		return <Text>Word card back</Text>;
	});
});

const mockUseWordCardUI = jest.mocked(useWordCardUI);

async function renderWithAFakeDispatchSoWeCanDoActions(
	children: ReactNode,
	cardDeckDispatch = jest.fn(),
) {
	const renderResult = await render(
		<CardDeckContext.Provider
			value={{
				cardDeckState: {
					...initialCardDeckState,
					isComplete: true,
					session: {
						id: 'completed-session',
						xpBefore: 0,
						results: [{ wordId: initialCardDeckState.currentId, outcome: 'correct', xp: 10 }],
						completion: { bonuses: [], totalXP: 10 },
					},
				},
				cardDeckDispatch,
			}}
		>
			{children}
		</CardDeckContext.Provider>,
	);

	return {
		cardDeckDispatch,
		...renderResult,
	};
}

describe('<WordCard />', () => {
	beforeEach(() => {
		mockRouter.replace.mockClear();
		mockUseWordCardUI.mockReset();
	});

	test('routes to the finished deck when the last card completes', async () => {
		mockUseWordCardUI.mockReturnValue({
			cardState: {
				...initialWordCardState,
				stage: 'COMPLETED',
			},
			wordCardUIDispatch: jest.fn(),
		});

		await renderWithAFakeDispatchSoWeCanDoActions(<WordCard isCurrent={true} />);

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith('/DeckResults');
		});
	});
});
