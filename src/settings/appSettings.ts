import { isValidCardsPerDeck } from '@/src/util/cardsPerDeck';

/**
 * Typing
 */
export interface AppSettings {
	useLearningLevelColors: boolean;
	useLevelOpacity: boolean;
	showDebugOptions: boolean;
	showSkipWordLink: boolean;
	cardsPerDeck: number | null;
}

export type BooleanSettingKey = Exclude<keyof AppSettings, 'cardsPerDeck'>;

const booleanSettingKeys: BooleanSettingKey[] = [
	'useLearningLevelColors',
	'useLevelOpacity',
	'showDebugOptions',
	'showSkipWordLink',
];

/**
 * Default settings
 */
export const defaultAppSettings: AppSettings = {
	useLearningLevelColors: false,
	useLevelOpacity: false,
	showDebugOptions: false,
	showSkipWordLink: true,
	cardsPerDeck: null,
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

	if (isValidCardsPerDeck(saved.cardsPerDeck)) {
		settingsCopy.cardsPerDeck = saved.cardsPerDeck;
	}

	return settingsCopy;
}
