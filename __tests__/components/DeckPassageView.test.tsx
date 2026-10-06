import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import DeckPassageView from '@/src/components/DeckPassageView';
import { emptyDeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { defaultAppSettings } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { wordProgressDefinitions } from '@/src/util/wordProgress';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

jest.mock('@/src/settings/useAppSettings');

describe('<DeckPassageView />', () => {
	beforeEach(() => {
		jest.mocked(useAppSettings).mockReturnValue({
			settings: defaultAppSettings,
			setSetting: jest.fn(),
		});

		/**
		 * Don't wait for animations (Copilot actually got this wrong)
		 */
		const animatedMock = jest.requireActual('react-native/Libraries/Animated/AnimatedMock').default;
		jest.spyOn(Animated, 'timing').mockImplementation(animatedMock.timing);
		jest.spyOn(Animated, 'parallel').mockImplementation(animatedMock.parallel);
	});

	afterEach(() => jest.restoreAllMocks());

	test('shows exempt text while ordinary unseen vocabulary stays hidden', async () => {
		const deck = makeMockCardDeck({
			passage: [
				{ text: 'Wallace', unlockExempt: true },
				{ text: '« hello »', wordId: 'hello', unlockExempt: true },
				{ text: 'pluie', wordId: 'rain', after: '.' },
			],
		});
		const { getByText, queryByText } = await render(
			<DeckPassageView
				deck={deck}
				wordProgressCounts={emptyDeckWordProgressCounts}
				wordProgressKeyByWordId={{}}
			/>,
		);

		expect(getByText('Wallace')).toBeTruthy();
		expect(getByText('« hello »')).toBeTruthy();
		expect(queryByText('pluie')).toBeNull();
		expect(getByText('?')).toBeTruthy();
		expect(getByText('Wallace')).toHaveStyle({ opacity: 1 });

		// Exempt words fade under every filter, including Known and Unseen.
		for (const { name } of wordProgressDefinitions) {
			await fireEvent.press(getByText(name));
			await waitFor(() => {
				expect(getByText('Wallace')).toHaveStyle({ opacity: 0.05 });
				expect(getByText('« hello »')).toHaveStyle({ opacity: 0.05 });
			});
		}

		// Toggling off the last filter restores exempt words.
		await fireEvent.press(getByText('Mastered'));
		await waitFor(() => expect(getByText('Wallace')).toHaveStyle({ opacity: 1 }));
	});
});
