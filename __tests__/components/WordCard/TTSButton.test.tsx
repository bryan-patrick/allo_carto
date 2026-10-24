import colors from '@/src/app/colors';
import TTSButton from '@/src/components/WordCard/TTSButton';
import { defaultAppSettings } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

jest.mock('expo-speech', () => ({ speak: jest.fn() }));
jest.mock('@/src/settings/useAppSettings');

jest.mock('expo-audio', () => ({ useAudioPlayer: jest.fn() }));

const mockUseAppSettings = jest.mocked(useAppSettings);

describe('<TTSButton />', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockUseAppSettings.mockReturnValue({ settings: defaultAppSettings, setSetting: jest.fn() });
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test.each([true, false])(
		'pronounces a correct answer once when automatic TTS is enabled: %s',
		async tts => {
			mockUseAppSettings.mockReturnValue({
				settings: { ...defaultAppSettings, ttsOnCorrectEnabled: tts },
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

			await act(() => jest.advanceTimersByTime(200));
			expect(useAudioPlayer).not.toHaveBeenCalled();

			if (tts) {
				expect(Speech.speak).toHaveBeenCalledWith(
					'le café',
					expect.objectContaining({ language: 'fr-CA', rate: 0.8, volume: 0.5 }),
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
			await act(() => jest.advanceTimersByTime(200));
			expect(Speech.speak).toHaveBeenCalledTimes(tts ? 1 : 0);
		},
	);

	test('manual pronunciation waits 200 ms with the button active, even with automatic TTS off', async () => {
		mockUseAppSettings.mockReturnValue({
			settings: { ...defaultAppSettings, ttsOnCorrectEnabled: false },
			setSetting: jest.fn(),
		});
		const { getByRole } = await render(<TTSButton wordsToSay="le café" />);
		await fireEvent.press(getByRole('button'));
		expect(getByRole('button')).toBeDisabled();
		expect(Speech.speak).not.toHaveBeenCalled();

		await act(() => jest.advanceTimersByTime(199));
		expect(Speech.speak).not.toHaveBeenCalled();
		await act(() => jest.advanceTimersByTime(1));
		expect(Speech.speak).toHaveBeenCalledTimes(1);
		expect(useAudioPlayer).not.toHaveBeenCalled();

		const speech = jest.mocked(Speech.speak).mock.calls[0][1]!;
		await act(() => speech.onStart?.());
		expect(getByRole('button')).toBeDisabled();

		await act(() => speech.onStopped?.());
		expect(getByRole('button')).toBeEnabled();
	});

	test('cancels automatic pronunciation if the card is left before speech starts', async () => {
		const { unmount } = await render(
			<TTSButton
				wordsToSay="le café"
				autoPlay
			/>,
		);
		await unmount();
		await act(() => jest.advanceTimersByTime(200));
		expect(Speech.speak).not.toHaveBeenCalled();
	});
});
