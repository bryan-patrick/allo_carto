import type { CompletedSolveStages } from '@/src/util/solveProgression';
import { isMockParagraphPreset } from './mockParagraphProgress';

/*
 * Typing
 */
export type PronunciationFormat = 'readable' | 'ipa';

interface BooleanSettings {
	soundEffectsEnabled: boolean;
	ttsOnCorrectEnabled: boolean;
	useLearningLevelColors: boolean;
	useLevelOpacity: boolean;
	showUnseenWords: boolean;
	showDebugOptions: boolean;
	previewAllStamps: boolean;
	showSkipWordLink: boolean;
	fastSolveUnlocks: boolean;
}

export interface AppSettings extends BooleanSettings {
	mockParagraphCompletion: CompletedSolveStages;
	soundEffectsVolume: number;
	ttsVolume: number;
	ttsRate: number;
	readingSpeechRate: number;
	pronunciationFormat: PronunciationFormat;
}

export type BooleanSettingKey = keyof BooleanSettings;

const booleanSettingKeys: BooleanSettingKey[] = [
	'soundEffectsEnabled',
	'ttsOnCorrectEnabled',
	'useLearningLevelColors',
	'useLevelOpacity',
	'showUnseenWords',
	'showDebugOptions',
	'previewAllStamps',
	'showSkipWordLink',
	'fastSolveUnlocks',
];

const volumeSettingKeys: ('soundEffectsVolume' | 'ttsVolume')[] = [
	'soundEffectsVolume',
	'ttsVolume',
];
export const maxAudioVolume = 1;
export const readingSpeechRates = [0.2, 0.5, 1];
const defaultSpeechRate = 0.8;

export function clampAudioVolume(volume: number): number {
	if (!Number.isFinite(volume)) {
		return 0;
	}

	return Math.max(0, Math.min(maxAudioVolume, volume));
}

// Keep speech at a useful pace, using the usual rate if the saved value is invalid.
export function clampSpeechRate(rate: number): number {
	if (!Number.isFinite(rate)) {
		return defaultSpeechRate;
	}

	return Math.max(0.2, Math.min(1.5, rate));
}

/*
 * Default settings
 */
export const defaultAppSettings: AppSettings = {
	mockParagraphCompletion: 1,
	soundEffectsEnabled: true,
	ttsOnCorrectEnabled: true,
	soundEffectsVolume: 0.1,
	ttsVolume: 0.5,
	ttsRate: defaultSpeechRate,
	readingSpeechRate: 1,
	useLearningLevelColors: false,
	useLevelOpacity: false,
	showUnseenWords: false,
	showDebugOptions: false,
	previewAllStamps: false,
	showSkipWordLink: true,
	fastSolveUnlocks: true,
	pronunciationFormat: 'readable',
};

export const appSettingsStorageKey = 'allo_carto.settings';

/*
 * Get the current settings and set defaults
 */
export function readAppSettings(value: string | null): AppSettings {
	const settingsCopy = { ...defaultAppSettings };
	let saved: Partial<AppSettings> | null = null;

	if (value === null) {
		return settingsCopy;
	}

	saved = JSON.parse(value);

	if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) {
		return settingsCopy;
	}

	for (const key of booleanSettingKeys) {
		const setting = saved[key];

		if (typeof setting === 'boolean') {
			settingsCopy[key] = setting;
		}
	}

	for (const key of volumeSettingKeys) {
		const volume = saved[key];

		if (typeof volume === 'number' && Number.isFinite(volume)) {
			settingsCopy[key] = clampAudioVolume(volume);
		}
	}

	if (typeof saved.ttsRate === 'number' && Number.isFinite(saved.ttsRate)) {
		settingsCopy.ttsRate = clampSpeechRate(saved.ttsRate);
	}

	if (
		typeof saved.readingSpeechRate === 'number' &&
		readingSpeechRates.includes(saved.readingSpeechRate)
	) {
		settingsCopy.readingSpeechRate = saved.readingSpeechRate;
	}

	if (saved.pronunciationFormat === 'readable' || saved.pronunciationFormat === 'ipa') {
		settingsCopy.pronunciationFormat = saved.pronunciationFormat;
	}

	if (isMockParagraphPreset(saved.mockParagraphCompletion)) {
		settingsCopy.mockParagraphCompletion = saved.mockParagraphCompletion;
	}

	return settingsCopy;
}
