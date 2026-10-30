import { clampAudioVolume } from '@/src/settings/appSettings';
import * as Speech from 'expo-speech';

interface SpeakFrenchOptions {
	text: string;
	volume: number;
	onPlayingChange: (playing: boolean) => void;
	onBoundary?: (charIndex: number) => void;
}

interface SpeechBoundaryEvent {
	charIndex: number;
}

let stopCurrentSpeech: (() => Promise<void>) | null = null;

/*
 * Read French text aloud for flashcards and stories, stopping any earlier speech first.
 * Return a function that stops this reading when the player leaves or presses Stop.
 */
export default function speakFrench({
	text,
	volume,
	onPlayingChange,
	onBoundary,
}: SpeakFrenchOptions): () => Promise<void> {
	const previousStop = stopCurrentSpeech?.();
	const timer = setTimeout(startSpeech, 200);
	let isActive = true;
	let hasStarted = false;

	stopCurrentSpeech = stop;
	onPlayingChange(true);

	function finishPlayback() {
		if (!isActive) {
			return;
		}

		isActive = false;
		clearTimeout(timer);

		if (stopCurrentSpeech === stop) {
			stopCurrentSpeech = null;
		}

		onPlayingChange(false);
	}

	async function stop() {
		if (!isActive) {
			return;
		}

		finishPlayback();

		if (hasStarted) {
			try {
				await Speech.stop();
			} catch (error) {
				console.error('Could not stop pronunciation:', error);
			}
		}
	}

	async function startSpeech() {
		await previousStop;
		if (!isActive) {
			return;
		}

		hasStarted = true;

		try {
			Speech.speak(text, {
				language: 'fr-CA',
				rate: 0.8,
				volume: clampAudioVolume(volume),
				onBoundary: (event: SpeechBoundaryEvent) => {
					if (isActive) {
						onBoundary?.(event.charIndex);
					}
				},
				onDone: finishPlayback,
				onStopped: finishPlayback,
				onError: finishPlayback,
			});
		} catch (error) {
			console.error('Could not start pronunciation:', error);
			finishPlayback();
		}
	}

	return stop;
}
