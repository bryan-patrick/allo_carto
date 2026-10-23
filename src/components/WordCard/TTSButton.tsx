import colors from '@/src/app/colors';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import MaterialSymbol from '../MaterialSymbol';

/**
 * Typing
 */
interface TTSButtonProps {
	wordsToSay: string;
}

/**
 * The TTS button for the word cards (front and back)
 */
export default function TTSButton({ wordsToSay }: TTSButtonProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const reduceMotion = useReducedMotion();
	const buttonStyles = [
		styles.button,
		isPlaying && styles.playing,
		isPlaying && !reduceMotion && styles.rocking,
	];
	const iconStyles = [styles.icon, isPlaying && styles.playingIcon];

	function finishPlayback() {
		setIsPlaying(false);
	}

	function speak() {
		Speech.speak(wordsToSay, {
			language: 'fr-CA',
			rate: 0.8,
			onStart: () => setIsPlaying(true),
			onDone: finishPlayback,
			onStopped: finishPlayback,
			onError: finishPlayback,
		});
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
