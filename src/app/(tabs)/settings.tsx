import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useState } from 'react';
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from 'react-native';
import MockParagraphProgressSetting from '../../components/MockParagraphProgressSetting';
import VolumeSetting from '../../components/VolumeSetting';
import { resetDB } from '../../db/interface';
import { useUserProgress } from '../../db/useUserProgress';
import {
	clampAudioVolume,
	type BooleanSettingKey,
	type PronunciationFormat,
} from '../../settings/appSettings';
import { useAppSettings } from '../../settings/useAppSettings';
import { solveStages } from '../../util/solveProgression';
import colors from '../colors';

/*
 * Typing
 */
interface PassageSetting {
	key: BooleanSettingKey;
	label: string;
	description?: string;
}

interface PronunciationOption {
	value: PronunciationFormat;
	label: string;
}

interface VoiceDownloadGuide {
	label: string;
	instructions: string;
	linkLabel: string;
	url: string;
}

const voiceDownloadGuidesByPlatform: Record<'ios' | 'android', VoiceDownloadGuide> = {
	ios: {
		label: 'iPhone and iPad',
		instructions:
			'Open device Settings → Accessibility → Read & Speak → Voices → French, then choose French (Canada). Choose a voice marked Enhanced.',
		linkLabel: 'Apple voice help',
		url: 'https://support.apple.com/en-us/111798',
	},
	android: {
		label: 'Android',
		instructions:
			'Open device Settings and search for Text-to-speech output. Open the settings for your preferred speech engine, then choose Install voice data. Download French (Canada), if offered. Voice choices and menu names vary by device.',
		linkLabel: 'Android voice help',
		url: 'https://support.google.com/accessibility/android/answer/6006983?hl=en',
	},
};

const voiceDownloadGuides = Platform.select({
	ios: [voiceDownloadGuidesByPlatform.ios],
	android: [voiceDownloadGuidesByPlatform.android],
	default: [voiceDownloadGuidesByPlatform.ios, voiceDownloadGuidesByPlatform.android],
});

// Open the voice download guide, and explain if the device cannot open it.
async function openVoiceDownloadGuide(url: string) {
	try {
		await Linking.openURL(url);
	} catch (error) {
		console.error('Could not open voice download help:', error);
		Alert.alert('Could not open help', 'Please try again.');
	}
}

const passageSettings: PassageSetting[] = [
	{
		key: 'showUnseenWords',
		label: 'Show new words in paragraphs',
		description: 'Enable to show new words in the paragraph.',
	},
	{ key: 'useLearningLevelColors', label: 'Use learning level colors' },
	{ key: 'useLevelOpacity', label: 'Use level opacity' },
];

const pronunciationOptions: PronunciationOption[] = [
	{ value: 'readable', label: 'Readable pronunciation' },
	{ value: 'ipa', label: 'IPA' },
];

/*
 * We explain both unlock settings using the same levels that open Solve stages.
 */
function getSolveUnlockDescription(): string {
	const stageDefinitions = Object.values(solveStages);
	const enhancedStages = stageDefinitions.filter(stage => stage.fastUnlockLevel > 0);
	const fastLevels = enhancedStages.map(stage => stage.fastUnlockLevel);
	const normalLevels = enhancedStages.map(stage => stage.normalUnlockLevel);
	const fastLevelsText = fastLevels.join(', ');
	const normalLevelsText = normalLevels.join(', ');

	return `Use player levels ${fastLevelsText} instead of ${normalLevelsText}. Complete each Solve stage before starting the next one.`;
}

export default function Settings() {
	const { reloadProgress, isUpdatingProgress } = useUserProgress();
	const { settings, setSetting } = useAppSettings();
	const solveUnlockDescription = getSolveUnlockDescription();

	/*
	 * State
	 */
	const [isResettingDB, setIsResettingDB] = useState(false);

	/*
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
				<Text style={styles.heading}>Pronunciation</Text>
				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Use TTS on correct answers</Text>
					<Switch
						accessibilityLabel="Pronounce correct answers"
						ios_backgroundColor={colors.dark.border}
						onValueChange={enabled => setSetting('ttsOnCorrectEnabled', enabled)}
						trackColor={{ false: colors.dark.border, true: colors.dark.primaryActive }}
						value={settings.ttsOnCorrectEnabled}
					/>
				</View>
				{settings.ttsOnCorrectEnabled && (
					<VolumeSetting
						label="TTS volume"
						value={settings.ttsVolume}
						onValueChange={value => setSetting('ttsVolume', clampAudioVolume(value))}
					/>
				)}
				<View
					accessibilityRole="radiogroup"
					accessibilityLabel="Pronunciation format"
					style={styles.cardCountOptions}
				>
					{pronunciationOptions.map(({ value, label }) => {
						const isSelected = settings.pronunciationFormat === value;

						return (
							<Pressable
								key={value}
								accessibilityRole="radio"
								accessibilityState={{ checked: isSelected }}
								onPress={() => setSetting('pronunciationFormat', value)}
								style={[styles.cardCountOption, isSelected && styles.selectedCardCountOption]}
							>
								<Text style={styles.text}>{label}</Text>
							</Pressable>
						);
					})}
				</View>
				<View style={styles.voiceDownloadHelp}>
					<Text style={styles.text}>Better voice quality</Text>
					<Text style={styles.settingDescription}>
						The app prefers an enhanced Canadian French voice. You can download one in your device
						settings.
					</Text>
					<Text style={styles.settingDescription}>
						Lower pitched voices tend to produce fewer popping sounds during playback. This can be
						adjusted in the voice settings.
					</Text>
					{voiceDownloadGuides.map(guide => (
						<View
							key={guide.label}
							style={styles.voiceDownloadHelp}
						>
							<Text style={styles.text}>{guide.label}</Text>
							<Text style={styles.settingDescription}>{guide.instructions}</Text>
							<Pressable
								accessibilityRole="link"
								accessibilityHint="Opens the support guide in your browser."
								onPress={() => openVoiceDownloadGuide(guide.url)}
								style={styles.voiceGuideLink}
							>
								<Text style={[styles.text, styles.linkText]}>{guide.linkLabel}</Text>
							</Pressable>
						</View>
					))}
				</View>
			</View>
			<View style={styles.section}>
				<Text style={styles.heading}>Passage display</Text>
				{passageSettings.map(({ key, label, description }) => (
					<View
						key={key}
						style={styles.settingRow}
					>
						<View style={styles.settingText}>
							<Text style={styles.settingLabel}>{label}</Text>
							{description && <Text style={styles.settingDescription}>{description}</Text>}
						</View>
						<Switch
							accessibilityLabel={label}
							accessibilityHint={description}
							ios_backgroundColor={colors.dark.border}
							onValueChange={enabled => setSetting(key, enabled)}
							trackColor={{ false: colors.dark.border, true: colors.dark.primaryActive }}
							value={settings[key]}
						/>
					</View>
				))}
			</View>
			<View style={styles.section}>
				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Sound effects</Text>
					<Switch
						accessibilityLabel="Sound effects"
						ios_backgroundColor={colors.dark.border}
						onValueChange={enabled => setSetting('soundEffectsEnabled', enabled)}
						trackColor={{ false: colors.dark.border, true: colors.dark.primaryActive }}
						value={settings.soundEffectsEnabled}
					/>
				</View>
				{settings.soundEffectsEnabled && (
					<VolumeSetting
						label="Sound effects volume"
						value={settings.soundEffectsVolume}
						onValueChange={value => setSetting('soundEffectsVolume', clampAudioVolume(value))}
					/>
				)}
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
					<View style={styles.section}>
						<Text style={styles.heading}>Solve progression</Text>
						<View style={styles.settingRow}>
							<View style={styles.settingText}>
								<Text style={styles.settingLabel}>Fast Solve Unlocks</Text>
								<Text style={styles.text}>{solveUnlockDescription}</Text>
							</View>
							<Switch
								accessibilityLabel="Fast Solve Unlocks"
								accessibilityHint="Change player level requirements. Saved Solve progress is kept."
								ios_backgroundColor={colors.dark.border}
								onValueChange={enabled => setSetting('fastSolveUnlocks', enabled)}
								trackColor={{
									false: colors.dark.border,
									true: colors.dark.primaryActive,
								}}
								value={settings.fastSolveUnlocks}
							/>
						</View>
					</View>
					<View style={styles.settingRow}>
						<View style={styles.settingText}>
							<Text style={styles.settingLabel}>Reveal all stamps</Text>
							<Text style={styles.settingDescription}>
								Treat unseen stamp words as seen once for screenshots. Saved progress stays the
								same. Turn this off to claim rewards.
							</Text>
						</View>
						<Switch
							accessibilityLabel="Reveal all stamps"
							accessibilityHint="Preview all collection stamps without changing saved progress."
							ios_backgroundColor={colors.dark.border}
							onValueChange={enabled => setSetting('previewAllStamps', enabled)}
							trackColor={{
								false: colors.dark.border,
								true: colors.dark.primaryActive,
							}}
							value={settings.previewAllStamps}
						/>
					</View>
					<MockParagraphProgressSetting disabled={isResettingDB} />
					<Pressable
						accessibilityRole="button"
						disabled={isResettingDB || isUpdatingProgress}
						style={[
							styles.resetPressable,
							(isResettingDB || isUpdatingProgress) && styles.disabledPressable,
						]}
						onPress={confirmResetDB}
					>
						<Text style={styles.text}>{isResettingDB ? 'Resetting DB...' : 'Reset DB'}</Text>
					</Pressable>
				</View>
			)}
		</ScrollView>
	);
}

/*
 * Styles
 */
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
	voiceDownloadHelp: {
		gap: 8,
	},
	voiceGuideLink: {
		minHeight: 44,
		justifyContent: 'center',
	},
	linkText: {
		color: colors.light.goldenBorder,
		textDecorationLine: 'underline',
	},
	cardCountOptions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	cardCountOption: {
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 44,
		minHeight: 44,
		paddingHorizontal: 12,
		borderColor: colors.light.border,
		borderWidth: 1,
		borderRadius: 8,
	},
	selectedCardCountOption: {
		backgroundColor: colors.dark.primaryActive,
		borderColor: colors.dark.primaryActive,
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
	settingText: {
		flex: 1,
		gap: 4,
	},
	settingDescription: {
		color: colors.light.background,
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
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
