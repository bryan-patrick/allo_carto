import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import DeckPassageView from '@/src/components/DeckPassageView';
import { emptyDeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { defaultAppSettings } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { wordProgressDefinitions } from '@/src/util/wordProgress';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import { Animated } from 'react-native';

jest.mock('@/src/settings/useAppSettings');
jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));

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

	// Keep unseen vocabulary out of the audio, and follow repeated words separately.
	test('reads visible words and highlights each occurrence until playback stops', async () => {
		jest.useFakeTimers();
		jest.mocked(useAppSettings).mockReturnValue({
			settings: { ...defaultAppSettings, useLevelOpacity: true },
			setSetting: jest.fn(),
		});
		const deck = makeMockCardDeck({
			passage: [
				{ text: 'Allô', unlockExempt: true, after: ' ! ' },
				{ text: 'secret', wordId: 'hidden' },
				{ text: 'des', wordId: 'some', after: '. ' },
				{ text: 'des', wordId: 'some', after: ' !' },
			],
		});
		const { getByRole, getByTestId, queryAllByText, unmount } = await render(
			<DeckPassageView
				deck={deck}
				wordProgressCounts={emptyDeckWordProgressCounts}
				wordProgressKeyByWordId={{ some: 'new' }}
			/>,
		);

		await fireEvent.press(getByRole('button', { name: 'Read story aloud' }));
		await act(() => jest.advanceTimersByTime(200));

		const [text, options] = jest.mocked(Speech.speak).mock.calls.at(-1)!;
		expect(text).toBe('Allô !  des. des !');
		expect(queryAllByText('secret')).toHaveLength(0);

		const onBoundary = options!.onBoundary as (event: { charIndex: number }) => void;
		await act(() => onBoundary({ charIndex: text.indexOf('des') }));
		expect(getByTestId('passage-word-2')).toHaveStyle({ opacity: 1 });
		expect(getByTestId('passage-word-3')).toHaveStyle({ opacity: 0.4 });

		await act(() => onBoundary({ charIndex: text.lastIndexOf('des') }));
		expect(getByTestId('passage-word-2')).toHaveStyle({ opacity: 0.4 });
		expect(getByTestId('passage-word-3')).toHaveStyle({ opacity: 1 });

		await fireEvent.press(getByRole('button', { name: 'Stop reading' }));
		expect(Speech.stop).toHaveBeenCalled();
		expect(getByTestId('passage-word-3')).toHaveStyle({ opacity: 0.4 });

		await unmount();
		jest.useRealTimers();
	});

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
