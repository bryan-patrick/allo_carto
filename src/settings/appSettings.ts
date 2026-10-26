import { isValidCardsPerDeck } from '@/src/util/cardsPerDeck';

/**
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
	showSkipWordLink: boolean;
}

export interface AppSettings extends BooleanSettings {
	soundEffectsVolume: number;
	ttsVolume: number;
	cardsPerDeck: number | null;
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
	'showSkipWordLink',
];

const volumeSettingKeys: ('soundEffectsVolume' | 'ttsVolume')[] = [
	'soundEffectsVolume',
	'ttsVolume',
];
export const maxAudioVolume = 0.5;

export function clampAudioVolume(volume: number): number {
	if (!Number.isFinite(volume)) {
		return 0;
	}

	return Math.max(0, Math.min(maxAudioVolume, volume));
}

/**
 * Default settings
 */
export const defaultAppSettings: AppSettings = {
	soundEffectsEnabled: true,
	ttsOnCorrectEnabled: true,
	soundEffectsVolume: 0.4,
	ttsVolume: maxAudioVolume,
	useLearningLevelColors: false,
	useLevelOpacity: false,
	showUnseenWords: false,
	showDebugOptions: false,
	showSkipWordLink: true,
	cardsPerDeck: null,
	pronunciationFormat: 'readable',
};

export const appSettingsStorageKey = 'allo_carto.settings';

/**
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

	if (isValidCardsPerDeck(saved.cardsPerDeck)) {
		settingsCopy.cardsPerDeck = saved.cardsPerDeck;
	}

	if (saved.pronunciationFormat === 'readable' || saved.pronunciationFormat === 'ipa') {
		settingsCopy.pronunciationFormat = saved.pronunciationFormat;
	}

	return settingsCopy;
}
