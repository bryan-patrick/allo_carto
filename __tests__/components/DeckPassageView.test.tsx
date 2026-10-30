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

interface SpeechBoundaryEvent {
	charIndex: number;
}

describe('<DeckPassageView />', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(useAppSettings).mockReturnValue({
			settings: defaultAppSettings,
			setSetting: jest.fn(),
		});

		/*
		 * Don't wait for animations (Copilot actually got this wrong)
		 */
		const animatedMock = jest.requireActual('react-native/Libraries/Animated/AnimatedMock').default;
		jest.spyOn(Animated, 'timing').mockImplementation(animatedMock.timing);
		jest.spyOn(Animated, 'parallel').mockImplementation(animatedMock.parallel);
	});

	afterEach(() => jest.restoreAllMocks());

	/*
	 * Including unseen words shifts the speech positions of the words after them.
	 * We check both settings so repeated words keep their own highlights.
	 */
	test.each([false, true])(
		'reads visible words and follows speech with unseen words shown: %s',
		async showUnseenWords => {
			jest.useFakeTimers();
			jest.mocked(useAppSettings).mockReturnValue({
				settings: { ...defaultAppSettings, useLevelOpacity: true, showUnseenWords },
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
			let expectedSpeech = 'Allô !  des. des !';
			let expectedUnseenOccurrences = 0;

			if (showUnseenWords) {
				expectedSpeech = 'Allô ! secret des. des !';
				expectedUnseenOccurrences = 1;
			}

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
			expect(text).toBe(expectedSpeech);
			expect(queryAllByText('secret')).toHaveLength(expectedUnseenOccurrences);

			const onBoundary = options!.onBoundary as (event: SpeechBoundaryEvent) => void;
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
		},
	);

	test.each([false, true])(
		'keeps exempt text readable and shows unseen words when enabled: %s',
		async showUnseenWords => {
			const deck = makeMockCardDeck({
				passage: [
					{ text: 'Wallace', unlockExempt: true },
					{ text: '« hello »', wordId: 'hello', unlockExempt: true },
					{ text: 'pluie', wordId: 'rain', after: '.' },
				],
			});

			jest.mocked(useAppSettings).mockReturnValue({
				settings: { ...defaultAppSettings, showUnseenWords },
				setSetting: jest.fn(),
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
			if (showUnseenWords) {
				expect(getByText('pluie')).toHaveStyle({ opacity: 1 });
				expect(queryByText('?')).toBeNull();
			} else {
				expect(queryByText('pluie')).toBeNull();
				expect(getByText('?')).toBeTruthy();
			}
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
		},
	);

	/*
	 * A setting change must stop the old reading before its word positions change.
	 * Late speech events should not bring an old highlight back.
	 */
	test('stops playback and clears highlighting when unseen-word visibility changes', async () => {
		const deck = makeMockCardDeck({
			passage: [
				{ text: 'secret', wordId: 'hidden' },
				{ text: 'des', wordId: 'some', after: '.' },
			],
		});
		const wordProgress = { some: 'new' } as const;
		const hiddenSettings = { ...defaultAppSettings, useLevelOpacity: true };
		const visibleSettings = { ...hiddenSettings, showUnseenWords: true };
		let previousSpeech;
		let previousBoundary: (event: SpeechBoundaryEvent) => void;

		jest.useFakeTimers();
		jest.mocked(useAppSettings).mockReturnValue({
			settings: hiddenSettings,
			setSetting: jest.fn(),
		});

		const { getByRole, getByTestId, queryByRole, rerender, unmount } = await render(
			<DeckPassageView
				deck={deck}
				wordProgressCounts={emptyDeckWordProgressCounts}
				wordProgressKeyByWordId={wordProgress}
			/>,
		);

		await fireEvent.press(getByRole('button', { name: 'Read story aloud' }));
		await act(() => jest.advanceTimersByTime(200));

		previousSpeech = jest.mocked(Speech.speak).mock.calls.at(-1)![1]!;
		previousBoundary = previousSpeech.onBoundary as (event: SpeechBoundaryEvent) => void;
		await act(() => previousBoundary({ charIndex: 1 }));
		expect(getByTestId('passage-word-1')).toHaveStyle({ opacity: 1 });

		jest.mocked(useAppSettings).mockReturnValue({
			settings: visibleSettings,
			setSetting: jest.fn(),
		});
		await rerender(
			<DeckPassageView
				deck={deck}
				wordProgressCounts={emptyDeckWordProgressCounts}
				wordProgressKeyByWordId={wordProgress}
			/>,
		);

		expect(Speech.stop).toHaveBeenCalledTimes(1);
		expect(queryByRole('button', { name: 'Stop reading' })).toBeNull();
		expect(getByTestId('passage-word-0')).toHaveTextContent('secret');
		expect(getByTestId('passage-word-1')).toHaveStyle({ opacity: 0.4 });

		await act(() => previousBoundary({ charIndex: 1 }));
		expect(getByTestId('passage-word-1')).toHaveStyle({ opacity: 0.4 });

		await fireEvent.press(getByRole('button', { name: 'Read story aloud' }));
		await act(() => jest.advanceTimersByTime(200));
		expect(Speech.speak).toHaveBeenLastCalledWith('secret des.', expect.any(Object));

		await unmount();
		jest.useRealTimers();
	});
});
