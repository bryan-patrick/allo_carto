import { CardDeckContext, initialCardDeckState } from '@/src/components/CardDeck/cardDeckContext';
import WordCard from '@/src/components/WordCard/WordCard';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import { render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ReactNode } from 'react';

jest.mock('@/src/components/WordCard/useWordCardUI');

jest.mock('expo-router', () => ({
	router: {
		push: jest.fn(),
		replace: jest.fn(),
	},
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
const mockRouterPush = jest.mocked(router.push);

async function renderWithAFakeDispatchSoWeCanDoActions(
	children: ReactNode,
	cardDeckDispatch = jest.fn(),
) {
	const renderResult = await render(
		<CardDeckContext.Provider
			value={{
				cardDeckState: initialCardDeckState,
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
		mockRouterPush.mockClear();
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
			expect(mockRouterPush).toHaveBeenCalledWith('/DeckResults');
		});
	});
});
