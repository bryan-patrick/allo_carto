import Storage from 'expo-sqlite/kv-store';
import { createContext, type ReactNode, useState } from 'react';
import { Alert } from 'react-native';
import {
	type AppSettings,
	appSettingsStorageKey,
	defaultAppSettings,
	readAppSettings,
} from './appSettings';

/**
 * Types
 */
type SetSetting = (key: keyof AppSettings, value: boolean | number | null) => void;

interface AppSettingsContextValue {
	settings: AppSettings;
	setSetting: SetSetting;
}

/**
 * The context
 */
export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

/**
 * Get current settings
 */
function getAppSettings(): AppSettings {
	try {
		return readAppSettings(Storage.getItemSync(appSettingsStorageKey));
	} catch (error) {
		console.error('Could not load settings:', error);
		return { ...defaultAppSettings };
	}
}

/**
 * The provider
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState(getAppSettings);

	const setSetting: SetSetting = (key, value) => {
		if (settings[key] === value) return;

		const nextSettings = {
			...settings,
			[key]: value,
		};

		try {
			Storage.setItemSync(appSettingsStorageKey, JSON.stringify(nextSettings));
			setSettings(nextSettings);
		} catch (error) {
			console.error('Could not save settings:', error);
			Alert.alert('Settings not saved', 'Could not save your settings. Please try again.');
		}
	};

	return <AppSettingsContext value={{ settings, setSetting }}>{children}</AppSettingsContext>;
}
