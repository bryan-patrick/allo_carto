import colors from '@/src/app/colors';
import { useAppSettings } from '@/src/settings/useAppSettings';
import speakFrench from '@/src/util/speakFrench';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import MaterialSymbol from './MaterialSymbol';

/**
 * Typing
 */
interface TTSButtonProps {
	wordsToSay: string;
	autoPlay?: boolean;
	accessibilityLabel?: string;
	disabled?: boolean;
	onBoundary?: (charIndex: number) => void;
	onPlaybackEnd?: () => void;
	stoppable?: boolean;
}

/**
 * We use the same TTS button for flashcards and story readings
 */
export default function TTSButton({
	wordsToSay,
	autoPlay = false,
	accessibilityLabel,
	disabled = false,
	onBoundary,
	onPlaybackEnd,
	stoppable = false,
}: TTSButtonProps) {
	const { settings } = useAppSettings();
	const [isPlaying, setIsPlaying] = useState(false);
	const autoPlayedWord = useRef<string | null>(null);
	const stopPlayback = useRef<(() => Promise<void>) | null>(null);
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
	}

	const speak = useCallback(() => {
		stopPlayback.current = speakFrench({
			text: wordsToSay,
			volume: settings.ttsVolume,
			onBoundary,
			onPlayingChange(playing) {
				setIsPlaying(playing);
				if (!playing) {
					onPlaybackEnd?.();
				}
			},
		});
	}, [wordsToSay, settings.ttsVolume, onBoundary, onPlaybackEnd]);

	useEffect(() => {
		return () => {
			stopPlayback.current?.();
		};
	}, [wordsToSay]);

	/**
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
			stopPlayback.current?.();
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

/**
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
