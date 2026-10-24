import colors from '@/src/app/colors';
import { clampAudioVolume } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import MaterialSymbol from '../MaterialSymbol';

/**
 * Typing
 */
interface TTSButtonProps {
	wordsToSay: string;
	autoPlay?: boolean;
}

interface SpeakWordOptions {
	wordsToSay: string;
	volume: number;
	setIsPlaying(playing: boolean): void;
}

const speechPaddingMs = 200;

function speakWord({ wordsToSay, volume, setIsPlaying }: SpeakWordOptions) {
	setIsPlaying(true);

	function finishPlayback() {
		setIsPlaying(false);
	}

	function startSpeech() {
		Speech.speak(wordsToSay, {
			language: 'fr-CA',
			rate: 0.8,
			volume: clampAudioVolume(volume),
			onStart: () => setIsPlaying(true),
			onDone: finishPlayback,
			onStopped: finishPlayback,
			onError: finishPlayback,
		});
	}

	const timer = setTimeout(startSpeech, speechPaddingMs);
	return timer;
}

/**
 * The TTS button for the word cards (front and back)
 */
export default function TTSButton({ wordsToSay, autoPlay = false }: TTSButtonProps) {
	const { settings } = useAppSettings();
	const [isPlaying, setIsPlaying] = useState(false);
	const autoPlayedWord = useRef<string | null>(null);
	const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const reduceMotion = useReducedMotion();
	const buttonStyles = [
		styles.button,
		isPlaying && styles.playing,
		isPlaying && !reduceMotion && styles.rocking,
	];
	const iconStyles = [styles.icon, isPlaying && styles.playingIcon];

	/**
	 * TTS on correct answer
	 */
	useEffect(() => {
		if (autoPlay && autoPlayedWord.current !== wordsToSay) {
			autoPlayedWord.current = wordsToSay;

			if (settings.ttsOnCorrectEnabled) {
				speechTimer.current = speakWord({ wordsToSay, volume: settings.ttsVolume, setIsPlaying });
			}
		}

		return () => {
			if (speechTimer.current !== null) {
				clearTimeout(speechTimer.current);
			}
		};
	}, [autoPlay, wordsToSay, settings.ttsOnCorrectEnabled, settings.ttsVolume]);

	function speak() {
		speechTimer.current = speakWord({ wordsToSay, volume: settings.ttsVolume, setIsPlaying });
	}

	return (
		<Pressable
			android_disableSound
			accessibilityLabel={`Pronounce ${wordsToSay}`}
			accessibilityRole="button"
			accessibilityState={{ busy: isPlaying, disabled: isPlaying }}
			disabled={isPlaying}
			hitSlop={8}
			onPress={speak}
		>
			<Animated.View style={buttonStyles}>
				<MaterialSymbol
					name="volume_up"
					size={24}
					style={iconStyles}
				/>
			</Animated.View>
		</Pressable>
	);
}

/**
 * Styles (css!)
 */
const styles = css.create({
	button: {
		borderRadius: 8,
		paddingHorizontal: 2,
	},
	playing: {
		backgroundColor: colors.dark.primaryActive,
	},
	icon: { color: colors.dark.text },
	playingIcon: { color: colors.light.text },
	rocking: {
		animationName: {
			from: { transform: [{ rotate: '-5deg' }] },
			to: { transform: [{ rotate: '5deg' }] },
		},
		animationDuration: '160ms',
		animationDirection: 'alternate',
		animationIterationCount: 'infinite',
	},
});
