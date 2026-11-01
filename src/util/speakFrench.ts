import { clampAudioVolume, clampSpeechRate } from '@/src/settings/appSettings';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export type SpeechPlaybackState = 'playing' | 'paused' | 'stopped';

export interface SpeechPlayback {
	stop: () => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
}

interface SpeakFrenchOptions {
	text: string;
	volume: number;
	rate: number;
	startPaused?: boolean;
	onStateChange: (state: SpeechPlaybackState) => void;
	onBoundary?: (charIndex: number) => void;
}

interface SpeechBoundaryEvent {
	charIndex: number;
}

let stopCurrentSpeech: (() => Promise<void>) | null = null;

/*
 * Find an enhanced Canadian French voice on the device if one is available.
 */
async function getEnhancedCanadianFrenchVoice(): Promise<string | undefined> {
	try {
		const availableVoices = await Speech.getAvailableVoicesAsync();
		const enhancedVoice = availableVoices.find(voice => {
			const isCanadianFrench = voice.language.toLowerCase() === 'fr-ca';
			const isEnhanced = voice.quality === Speech.VoiceQuality.Enhanced;

			return isCanadianFrench && isEnhanced;
		});

		return enhancedVoice?.identifier;
	} catch (error) {
		console.warn('Could not find an enhanced Canadian French voice:', error);
		return undefined;
	}
}

/*
 * Read French text aloud for flashcards and stories, stopping any earlier speech first.
 * Keep the reading position when paused so Play can continue from there.
 */
export default function speakFrench({
	text,
	volume,
	rate,
	startPaused = false,
	onStateChange,
	onBoundary,
}: SpeakFrenchOptions): SpeechPlayback {
	const previousStop = stopCurrentSpeech?.();
	const timer = setTimeout(scheduleSpeech, 200);
	let pendingSpeechAction = previousStop ?? Promise.resolve();
	let playbackState: SpeechPlaybackState = startPaused ? 'paused' : 'playing';
	let hasStarted = false;
	let currentCharacterIndex = 0;
	let utteranceId = 0;

	stopCurrentSpeech = stop;
	onStateChange(playbackState);

	// Keep pause, resume, and stop in order when the controls are tapped quickly.
	function queueSpeechAction(action: () => Promise<void>): Promise<void> {
		pendingSpeechAction = pendingSpeechAction.then(action).catch(handleSpeechError);
		return pendingSpeechAction;
	}

	function scheduleSpeech() {
		queueSpeechAction(startSpeech);
	}

	function finishPlayback() {
		if (playbackState === 'stopped') {
			return;
		}

		playbackState = 'stopped';
		clearTimeout(timer);

		if (stopCurrentSpeech === stop) {
			stopCurrentSpeech = null;
		}

		onStateChange('stopped');
	}

	function stop(): Promise<void> {
		if (playbackState === 'stopped') {
			return pendingSpeechAction;
		}

		finishPlayback();
		return queueSpeechAction(stopSpeech);
	}

	async function stopSpeech() {
		if (hasStarted) {
			await Speech.stop();

			if (Platform.OS !== 'android') {
				await Speech.resume();
			}

			hasStarted = false;
		}
	}

	function pause(): Promise<void> {
		if (playbackState !== 'playing') {
			return pendingSpeechAction;
		}

		clearTimeout(timer);
		playbackState = 'paused';
		onStateChange('paused');
		return queueSpeechAction(pauseSpeech);
	}

	async function pauseSpeech() {
		if (playbackState !== 'paused' || !hasStarted) {
			return;
		}

		if (Platform.OS === 'android') {
			// Android cannot pause speech. Save the current word and ignore the canceled reading.
			utteranceId += 1;
			hasStarted = false;
			await Speech.stop();
		} else {
			await Speech.pause();
		}
	}

	function resume(): Promise<void> {
		if (playbackState !== 'paused') {
			return pendingSpeechAction;
		}

		playbackState = 'playing';
		onStateChange('playing');
		return queueSpeechAction(resumeSpeech);
	}

	async function resumeSpeech() {
		if (playbackState !== 'playing') {
			return;
		}

		if (hasStarted) {
			await Speech.resume();
		} else {
			await startSpeech();
		}
	}

	async function startSpeech() {
		const preferredVoice = await getEnhancedCanadianFrenchVoice();
		const startCharacterIndex = currentCharacterIndex;
		const currentUtteranceId = utteranceId + 1;
		const remainingText = text.slice(startCharacterIndex);

		if (playbackState !== 'playing' || hasStarted) {
			return;
		}

		hasStarted = true;
		utteranceId = currentUtteranceId;

		Speech.speak(remainingText, {
			language: 'fr-CA',
			voice: preferredVoice,
			rate: clampSpeechRate(rate),
			volume: clampAudioVolume(volume),
			onBoundary(event: SpeechBoundaryEvent) {
				if (playbackState === 'playing' && currentUtteranceId === utteranceId) {
					currentCharacterIndex = startCharacterIndex + event.charIndex;
					onBoundary?.(currentCharacterIndex);
				}
			},
			onDone: finishUtterance,
			onStopped: finishUtterance,
			onError: finishUtterance,
		});

		function finishUtterance() {
			if (currentUtteranceId === utteranceId) {
				finishPlayback();
			}
		}
	}

	async function handleSpeechError(error: unknown) {
		console.error('Could not control pronunciation:', error);

		if (playbackState !== 'stopped') {
			try {
				await Speech.stop();
			} catch (stopError) {
				console.error('Could not stop pronunciation:', stopError);
			}

			finishPlayback();
		}
	}

	return {
		stop,
		pause,
		resume,
	};
}
