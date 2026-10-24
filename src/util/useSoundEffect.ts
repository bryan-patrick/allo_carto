import { useAppSettings } from '@/src/settings/useAppSettings';
import { AudioSource, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

const sounds: Record<string, AudioSource> = {
	correct: require('@/src/app/assets/sounds/correct.m4a'),
	incorrect: require('@/src/app/assets/sounds/incorrect.m4a'),
	levelUp: require('@/src/app/assets/sounds/level-up.m4a'),
	tap: require('@/src/app/assets/sounds/tap.wav'),
};

/**
 * This hook is used to play sounds in the application
 * The played sound is the key of sounds
 * Sound effects are used during flash cards and when leveling up
 */
export function useSoundEffect(sound: keyof typeof sounds) {
	const { settings } = useAppSettings();
	const player = useAudioPlayer(sounds[sound]);
	const onFinished = useRef<(() => void) | undefined>(undefined);
	const activePlayer = useRef<AudioPlayer | null>(null);
	const enabled = settings.soundEffectsEnabled;

	useEffect(() => {
		activePlayer.current = player;
		activePlayer.current.volume = sound === 'tap' ? 0.1 : 0.5;

		function finishPlayback() {
			const callback = onFinished.current;
			onFinished.current = undefined;
			callback?.();
		}

		const subscription = player.addListener('playbackStatusUpdate', status => {
			if (status.didJustFinish) {
				finishPlayback();
			}
		});

		if (!enabled) {
			activePlayer.current = null;
			player.pause();
			finishPlayback();
		}

		return () => {
			activePlayer.current = null;
			subscription.remove();
		};
	}, [enabled, player, sound]);

	const playSound = useCallback(
		async function playSound(afterSound?: () => void) {
			if (!enabled) {
				afterSound?.();
				return;
			}

			const audioPlayer = activePlayer.current;
			if (!audioPlayer) {
				return;
			}

			onFinished.current = afterSound;
			try {
				await audioPlayer.seekTo(0);
				if (activePlayer.current !== audioPlayer) {
					return;
				}

				audioPlayer.play();
			} catch (error) {
				console.warn(`Could not play ${sound} sound:`, error);
				if (activePlayer.current === audioPlayer) {
					const callback = onFinished.current;
					onFinished.current = undefined;
					callback?.();
				}
			}
		},
		[enabled, sound],
	);

	return playSound;
}
