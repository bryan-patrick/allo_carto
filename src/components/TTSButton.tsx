import colors from '@/src/app/colors';
import { useAppSettings } from '@/src/settings/useAppSettings';
import speakFrench, { type SpeechPlayback, type SpeechPlaybackState } from '@/src/util/speakFrench';
import { type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import MaterialSymbol from './MaterialSymbol';

/*
 * Typing
 */
interface TTSButtonProps {
	wordsToSay: string;
	ref?: Ref<TTSButtonHandle>;
	rate?: number;
	autoPlay?: boolean;
	accessibilityLabel?: string;
	disabled?: boolean;
	onBoundary?: (charIndex: number) => void;
	onPlaybackEnd?: () => void;
	onPlaybackStateChange?: (state: SpeechPlaybackState) => void;
	stoppable?: boolean;
}

export interface TTSButtonHandle {
	playFrom: (characterIndex: number, rate?: number, startPaused?: boolean) => void;
	togglePlayback: () => void;
}

/*
 * We use the same TTS button for flashcards and story readings
 */
export default function TTSButton({
	wordsToSay,
	ref,
	rate,
	autoPlay = false,
	accessibilityLabel,
	disabled = false,
	onBoundary,
	onPlaybackEnd,
	onPlaybackStateChange,
	stoppable = false,
}: TTSButtonProps) {
	const { settings } = useAppSettings();
	const [playbackState, setPlaybackState] = useState<SpeechPlaybackState>('stopped');
	const isPlaying = playbackState === 'playing';
	const autoPlayedWord = useRef<string | null>(null);
	const playback = useRef<SpeechPlayback | null>(null);
	const reduceMotion = useReducedMotion();
	const buttonStyles = [
		styles.button,
		isPlaying && styles.playing,
		isPlaying && !reduceMotion && styles.rocking,
	];
	const iconStyles = [styles.icon, isPlaying && styles.playingIcon];
	const isDisabled = disabled || (isPlaying && !stoppable);
	let buttonLabel = accessibilityLabel ?? `Pronounce ${wordsToSay}`;

	if (isPlaying && stoppable) {
		buttonLabel = 'Stop reading';
	} else if (playbackState === 'paused') {
		buttonLabel = 'Resume reading';
	}

	const speak = useCallback(
		(startCharacterIndex = 0, playbackRate = rate ?? settings.ttsRate, startPaused = false) => {
			const remainingText = wordsToSay.slice(startCharacterIndex);

			playback.current = speakFrench({
				text: remainingText,
				volume: settings.ttsVolume,
				rate: playbackRate,
				startPaused,
				onBoundary(characterIndex) {
					const passageCharacterIndex = startCharacterIndex + characterIndex;

					onBoundary?.(passageCharacterIndex);
				},
				onStateChange(state) {
					setPlaybackState(state);
					onPlaybackStateChange?.(state);

					if (state === 'stopped') {
						onPlaybackEnd?.();
					}
				},
			});

			onBoundary?.(startCharacterIndex);
		},
		[
			wordsToSay,
			rate,
			settings.ttsVolume,
			settings.ttsRate,
			onBoundary,
			onPlaybackEnd,
			onPlaybackStateChange,
		],
	);

	const togglePlayback = useCallback(() => {
		if (playbackState === 'playing') {
			playback.current?.pause();
		} else if (playbackState === 'paused') {
			playback.current?.resume();
		} else {
			speak();
		}
	}, [playbackState, speak]);

	useImperativeHandle(
		ref,
		() => ({
			playFrom: speak,
			togglePlayback,
		}),
		[speak, togglePlayback],
	);

	useEffect(() => {
		return () => {
			playback.current?.stop();
		};
	}, [wordsToSay]);

	/*
	 * TTS on correct answer
	 */
	useEffect(() => {
		if (autoPlay && autoPlayedWord.current !== wordsToSay) {
			autoPlayedWord.current = wordsToSay;

			if (settings.ttsOnCorrectEnabled && !disabled) {
				speak();
			}
		}
	}, [autoPlay, wordsToSay, settings.ttsOnCorrectEnabled, disabled, speak]);

	function handlePress() {
		if (isPlaying) {
			playback.current?.stop();
		} else if (playbackState === 'paused') {
			playback.current?.resume();
		} else {
			speak();
		}
	}

	return (
		<Pressable
			android_disableSound
			accessibilityLabel={buttonLabel}
			accessibilityRole="button"
			accessibilityState={{ busy: isPlaying, disabled: isDisabled }}
			disabled={isDisabled}
			hitSlop={8}
			onPress={handlePress}
			style={disabled && styles.disabled}
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

/*
 * Styles (css!)
 */
const styles = css.create({
	button: {
		borderRadius: 8,
		paddingHorizontal: 2,
	},
	disabled: {
		opacity: 0.35,
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
