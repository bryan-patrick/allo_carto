import colors from '@/src/app/colors';
import TTSButton from '@/src/components/WordCard/TTSButton';
import { defaultAppSettings } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

jest.mock('expo-speech', () => ({ speak: jest.fn() }));
jest.mock('@/src/settings/useAppSettings');

const mockPlaybackListeners = new Set<(status: { didJustFinish: boolean }) => void>();

jest.mock('expo-audio', () => {
	const player = {
		volume: 1,
		seekTo: jest.fn(async () => {}),
		play: jest.fn(),
		pause: jest.fn(),
		addListener: jest.fn(
			(_event: string, listener: (status: { didJustFinish: boolean }) => void) => {
				mockPlaybackListeners.add(listener);
				return { remove: () => mockPlaybackListeners.delete(listener) };
			},
		),
	};
	return { useAudioPlayer: jest.fn(() => player) };
});

const mockUseAppSettings = jest.mocked(useAppSettings);

describe('<TTSButton />', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockPlaybackListeners.clear();
		mockUseAppSettings.mockReturnValue({ settings: defaultAppSettings, setSetting: jest.fn() });
	});

	test.each([
		[true, true],
		[true, false],
		[false, true],
		[false, false],
	])('sequences correct feedback (effects: %s, automatic TTS: %s)', async (effects, tts) => {
		mockUseAppSettings.mockReturnValue({
			settings: { ...defaultAppSettings, soundEffectsEnabled: effects, ttsOnCorrectEnabled: tts },
			setSetting: jest.fn(),
		});
		const { getByRole, getByText, rerender } = await render(<TTSButton wordsToSay="le café" />);
		expect(Speech.speak).not.toHaveBeenCalled();

		await rerender(
			<TTSButton
				wordsToSay="le café"
				autoPlay
			/>,
		);

		const player = jest.mocked(useAudioPlayer).mock.results[0].value;
		if (effects) {
			await waitFor(() => expect(player.play).toHaveBeenCalledTimes(1));
			expect(Speech.speak).not.toHaveBeenCalled();
			await act(() => {
				mockPlaybackListeners.forEach(listener => listener({ didJustFinish: true }));
			});
		} else {
			expect(player.play).not.toHaveBeenCalled();
		}

		if (tts) {
			expect(Speech.speak).toHaveBeenCalledWith(
				'le café',
				expect.objectContaining({ language: 'fr-CA', rate: 0.8 }),
			);
			const speech = jest.mocked(Speech.speak).mock.calls[0][1]!;
			await act(() => speech.onStart?.());
			expect(getByRole('button', { busy: true })).toBeDisabled();
			expect(getByText('volume_up')).toHaveStyle({ color: colors.light.text });

			await act(() => speech.onDone?.());
			expect(getByRole('button', { busy: false })).toBeEnabled();
		} else {
			expect(Speech.speak).not.toHaveBeenCalled();
		}
		expect(getByText('volume_up')).toHaveStyle({ color: colors.dark.text });
		await rerender(
			<TTSButton
				wordsToSay="le café"
				autoPlay
			/>,
		);
		await act(() => {
			mockPlaybackListeners.forEach(listener => listener({ didJustFinish: true }));
		});
		expect(Speech.speak).toHaveBeenCalledTimes(tts ? 1 : 0);
	});

	test('manual pronunciation uses the same active state and clears it when stopped', async () => {
		mockUseAppSettings.mockReturnValue({
			settings: { ...defaultAppSettings, ttsOnCorrectEnabled: false },
			setSetting: jest.fn(),
		});
		const { getByRole } = await render(<TTSButton wordsToSay="le café" />);
		await fireEvent.press(getByRole('button'));

		const speech = jest.mocked(Speech.speak).mock.calls[0][1]!;
		await act(() => speech.onStart?.());
		expect(getByRole('button')).toBeDisabled();

		await act(() => speech.onStopped?.());
		expect(getByRole('button')).toBeEnabled();
	});

	test('does not start TTS if the card is left while the correct sound is playing', async () => {
		const { unmount } = await render(
			<TTSButton
				wordsToSay="le café"
				autoPlay
			/>,
		);
		const player = jest.mocked(useAudioPlayer).mock.results[0].value;
		await waitFor(() => expect(player.play).toHaveBeenCalledTimes(1));

		await unmount();
		expect(Speech.speak).not.toHaveBeenCalled();
		expect(mockPlaybackListeners.size).toBe(0);
	});
});
