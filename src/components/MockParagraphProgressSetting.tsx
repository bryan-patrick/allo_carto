import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { mockParagraphPresets } from '@/src/settings/mockParagraphProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface MockParagraphProgressSettingProps {
	disabled: boolean;
}

/**
 * Lets the player apply saved paragraph completion presets from the debug settings.
 */
export default function MockParagraphProgressSetting({
	disabled,
}: MockParagraphProgressSettingProps) {
	const { settings, setSetting } = useAppSettings();
	const { applyMockParagraphProgress, isUpdatingProgress, status } = useUserProgress();
	const selectedPreset = mockParagraphPresets.find(preset => {
		return preset.completedStages === settings.mockParagraphCompletion;
	});
	const isDisabled = disabled || isUpdatingProgress || status === 'loading';
	const actionLabel = isUpdatingProgress ? 'Saving progress…' : 'Apply preset';

	async function applyPreset() {
		if (isDisabled || !selectedPreset) {
			return;
		}

		const paragraphCount = await applyMockParagraphProgress(selectedPreset.completedStages);

		if (paragraphCount === false) {
			Alert.alert(
				'Preset not applied',
				'Could not save mock paragraph progress. Please try again.',
			);
			return;
		}

		Alert.alert(
			'Preset applied',
			`${selectedPreset.label} saved for ${paragraphCount} paragraphs.`,
		);
	}

	function confirmApplyPreset() {
		if (isDisabled || !selectedPreset) {
			return;
		}

		Alert.alert(
			`Apply ${selectedPreset.label.toLowerCase()} to all paragraphs?`,
			'This replaces your saved Solve answers and completions, and marks paragraph words as seen. Your XP, Ink, and correct flashcard answers are kept.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Apply preset',
					style: 'destructive',
					onPress: applyPreset,
				},
			],
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Mock paragraph progress</Text>
			<Text style={styles.description}>
				Choose a completion state for every paragraph, then apply it to your saved progress.
			</Text>
			<View
				accessibilityRole="radiogroup"
				accessibilityLabel="Mock paragraph completion preset"
				style={styles.options}
			>
				{mockParagraphPresets.map(preset => {
					const isSelected = preset.completedStages === settings.mockParagraphCompletion;
					const accessibilityState = {
						checked: isSelected,
						disabled: isDisabled,
					};

					return (
						<Pressable
							key={preset.completedStages}
							accessibilityRole="radio"
							accessibilityState={accessibilityState}
							disabled={isDisabled}
							onPress={() => setSetting('mockParagraphCompletion', preset.completedStages)}
							style={[styles.option, isSelected && styles.selectedOption]}
						>
							<Text style={styles.text}>{preset.label}</Text>
						</Pressable>
					);
				})}
			</View>
			<Text style={styles.description}>{selectedPreset?.description}</Text>
			<Pressable
				accessibilityRole="button"
				accessibilityState={{
					disabled: isDisabled,
				}}
				disabled={isDisabled}
				onPress={confirmApplyPreset}
				style={[styles.applyButton, isDisabled && styles.disabledButton]}
			>
				<Text style={styles.text}>{actionLabel}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 12,
	},
	title: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
	},
	description: {
		color: colors.light.background,
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
	},
	options: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	option: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 44,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
	},
	selectedOption: {
		backgroundColor: colors.dark.primaryActive,
		borderColor: colors.dark.primaryActive,
	},
	text: {
		color: colors.light.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	applyButton: {
		alignItems: 'center',
		padding: 16,
		backgroundColor: colors.dark.primary,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
	},
	disabledButton: {
		backgroundColor: colors.dark.border,
	},
});
