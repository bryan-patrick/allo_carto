import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { resetDB } from '../../db/interface';
import { useUserProgress } from '../../db/useUserProgress';
import type { AppSettings } from '../../settings/appSettings';
import { useAppSettings } from '../../settings/useAppSettings';
import colors from '../colors';

const passageSettings: { key: keyof AppSettings; label: string }[] = [
	{ key: 'useLearningLevelColors', label: 'Use learning level colors' },
	{ key: 'useLevelOpacity', label: 'Use level opacity' },
];

export default function Settings() {
	const { reloadProgress } = useUserProgress();
	const { settings, setSetting } = useAppSettings();

	/**
	 * State
	 */
	const [isResettingDB, setIsResettingDB] = useState(false);

	/**
	 * Reset the local DB, then rebuild the seed data.
	 */
	async function handleResetDB() {
		setIsResettingDB(true);

		try {
			await impactAsync(ImpactFeedbackStyle.Heavy);
			await resetDB();
			await reloadProgress();

			Alert.alert('DB reset', 'The local database has been reset.');
		} catch (error) {
			console.error('Failed to reset the DB:', error);

			Alert.alert('Reset failed', 'Could not reset the local database.');
		} finally {
			setIsResettingDB(false);
		}
	}

	function confirmResetDB() {
		Alert.alert('Reset DB?', 'This will clear local progress and rebuild the seeded data.', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Reset DB',
				style: 'destructive',
				onPress: handleResetDB,
			},
		]);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
		>
			<View style={styles.section}>
				<Text style={styles.heading}>Passage display</Text>
				{passageSettings.map(({ key, label }) => (
					<View
						key={key}
						style={styles.settingRow}
					>
						<Text style={styles.settingLabel}>{label}</Text>
						<Switch
							accessibilityLabel={label}
							ios_backgroundColor={colors.dark.border}
							onValueChange={enabled => setSetting(key, enabled)}
							trackColor={{ false: colors.dark.border, true: colors.dark.primaryActive }}
							value={settings[key]}
						/>
					</View>
				))}
			</View>
			<View style={styles.settingRow}>
				<Text style={styles.settingLabel}>Show skip word link</Text>
				<Switch
					accessibilityLabel="Show skip word link"
					ios_backgroundColor={colors.dark.border}
					onValueChange={enabled => setSetting('showSkipWordLink', enabled)}
					trackColor={{ false: colors.dark.border, true: colors.dark.primaryActive }}
					value={settings.showSkipWordLink}
				/>
			</View>
			<View style={styles.settingRow}>
				<Text style={styles.settingLabel}>Show debug options</Text>
				<Switch
					accessibilityLabel="Show debug options"
					ios_backgroundColor={colors.dark.border}
					onValueChange={enabled => setSetting('showDebugOptions', enabled)}
					trackColor={{ false: colors.dark.border, true: colors.dark.primaryActive }}
					value={settings.showDebugOptions}
				/>
			</View>
			{settings.showDebugOptions && (
				<View style={styles.section}>
					<Text style={styles.heading}>Debug</Text>
					<Pressable
						accessibilityRole="button"
						disabled={isResettingDB}
						style={[styles.resetPressable, isResettingDB && styles.disabledPressable]}
						onPress={confirmResetDB}
					>
						<Text style={styles.text}>{isResettingDB ? 'Resetting DB...' : 'Reset DB'}</Text>
					</Pressable>
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.dark.background,
	},
	content: {
		padding: 24,
		gap: 24,
	},
	text: {
		color: colors.light.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	section: {
		gap: 12,
	},
	settingRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 16,
		paddingVertical: 12,
		borderBottomColor: colors.dark.border,
		borderBottomWidth: 1,
	},
	settingLabel: {
		color: colors.light.text,
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	heading: {
		color: colors.light.text,
		fontFamily: 'lexend-700',
		fontSize: 20,
	},
	resetPressable: {
		alignItems: 'center',
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.light.danger,
	},
	disabledPressable: {
		opacity: 0.6,
	},
});
