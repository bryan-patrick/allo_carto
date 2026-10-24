import colors from '@/src/app/colors';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { useSoundEffect } from '@/src/util/useSoundEffect';
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
	setIsPlaying(playing: boolean): void;
}

function speakWord({ wordsToSay, setIsPlaying }: SpeakWordOptions) {
	function finishPlayback() {
		setIsPlaying(false);
	}

	Speech.speak(wordsToSay, {
		language: 'fr-CA',
		rate: 0.8,
		onStart: () => setIsPlaying(true),
		onDone: finishPlayback,
		onStopped: finishPlayback,
		onError: finishPlayback,
	});
}

/**
 * The TTS button for the word cards (front and back)
 */
export default function TTSButton({ wordsToSay, autoPlay = false }: TTSButtonProps) {
	const { settings } = useAppSettings();
	const playCorrect = useSoundEffect('correct');
	const [isPlaying, setIsPlaying] = useState(false);
	const autoPlayedWord = useRef<string | null>(null);
	const shouldAutoSpeak = useRef(false);
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
		shouldAutoSpeak.current = autoPlay && settings.ttsOnCorrectEnabled;

		async function pronounceCorrectAnswer() {
			const completed = await playCorrect();

			if (completed && shouldAutoSpeak.current && autoPlayedWord.current === wordsToSay) {
				speakWord({ wordsToSay, setIsPlaying });
			}
		}

		if (autoPlay && autoPlayedWord.current !== wordsToSay) {
			autoPlayedWord.current = wordsToSay;
			pronounceCorrectAnswer();
		}

		return () => {
			shouldAutoSpeak.current = false;
		};
	}, [autoPlay, wordsToSay, playCorrect, settings.ttsOnCorrectEnabled]);

	function speak() {
		speakWord({ wordsToSay, setIsPlaying });
	}

	return (
		<Pressable
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
