/**
 * Typing
 */
export interface AppSettings {
	[key: string]: boolean;
	useLearningLevelColors: boolean;
	useLevelOpacity: boolean;
	showDebugOptions: boolean;
}

/**
 * Default settings
 */
export const defaultAppSettings: AppSettings = {
	useLearningLevelColors: true,
	useLevelOpacity: false,
	showDebugOptions: false,
};

export const appSettingsStorageKey = 'allo_carto.settings';

/**
 * Get the current settings and set defaults
 */
export function readAppSettings(value: string | null): AppSettings {
	const settingsCopy = { ...defaultAppSettings };
	let saved: AppSettings | null = null;

	if (value === null) {
		return settingsCopy;
	}

	saved = JSON.parse(value);

	if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) {
		return settingsCopy;
	}

	for (const key of Object.keys(settingsCopy)) {
		const setting = saved[key];

		if (typeof setting === 'boolean') {
			settingsCopy[key] = setting;
		}
	}

	return settingsCopy;
}
