import { clampAudioVolume } from '@/src/settings/appSettings';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { AudioSource, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

const sounds: Record<string, AudioSource> = {
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
	const player = useAudioPlayer(sounds[sound], { keepAudioSessionActive: true });
	const activePlayer = useRef<AudioPlayer | null>(null);
	const playbackFinished = useRef<((completed: boolean) => void) | null>(null);
	const enabled = settings.soundEffectsEnabled;
	const volume = clampAudioVolume(settings.soundEffectsVolume);

	useEffect(() => {
		activePlayer.current = player;
		activePlayer.current.volume = sound === 'tap' ? volume * 0.375 : volume;

		function finishPlayback(completed: boolean) {
			const resolve = playbackFinished.current;
			playbackFinished.current = null;
			resolve?.(completed);
		}

		const subscription = player.addListener('playbackStatusUpdate', status => {
			if (status.didJustFinish) {
				finishPlayback(true);
			}
		});

		if (!enabled) {
			activePlayer.current = null;
			player.pause();
		}

		return () => {
			activePlayer.current = null;
			finishPlayback(false);
			subscription.remove();
		};
	}, [enabled, player, sound, volume]);

	const playSound = useCallback(
		async function playSound() {
			if (!enabled) {
				return true;
			}

			const audioPlayer = activePlayer.current;
			if (!audioPlayer) {
				return false;
			}

			playbackFinished.current?.(false);
			playbackFinished.current = null;
			try {
				await audioPlayer.seekTo(0);
				if (activePlayer.current !== audioPlayer) {
					return false;
				}

				const finished = new Promise<boolean>(resolve => {
					playbackFinished.current = resolve;
				});
				audioPlayer.play();
				return await finished;
			} catch (error) {
				playbackFinished.current = null;
				console.warn(`Could not play ${sound} sound:`, error);
				return activePlayer.current === audioPlayer;
			}
		},
		[enabled, sound],
	);

	return playSound;
}
