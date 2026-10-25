import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import {
	formatUnlockCriterion,
	isItemReadyToUnlock,
	shouldShowUnlockRequirements,
	type UnlockCriteria,
} from '@/src/util/atlasCompletion';
import { useState } from 'react';
import {
	Alert,
	Pressable,
	StyleSheet,
	Text,
	View,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import LinkButton from './LinkButton';
import MaterialSymbol from './MaterialSymbol';

interface LockedSectionProps {
	circular?: boolean;
	color?: string;
	textColor?: string;
	unlockCriteria: UnlockCriteria[];
	itemId?: string;
	style?: StyleProp<ViewStyle>;
	fontSizeOffset?: number;
}

/**
 * We show unlock details when the next story, chapter, or paragraph meets one requirement.
 */
export default function LockedSection({
	circular = false,
	color = colors.utility.cardBorder,
	textColor = colors.dark.text,
	unlockCriteria,
	itemId,
	style,
	fontSizeOffset = 0,
}: LockedSectionProps) {
	const { experience, progressById, isUpdatingProgress, unlockItem } = useUserProgress();
	const [isUnlocking, setIsUnlocking] = useState(false);
	const canShowRequirements = Boolean(
		itemId &&
		shouldShowUnlockRequirements({ id: itemId, progressById, userLevel: experience.level }),
	);
	const isReady = Boolean(
		canShowRequirements &&
		itemId &&
		isItemReadyToUnlock({ id: itemId, progressById, userLevel: experience.level }),
	);
	const itemType = itemId ? (progressById[itemId]?.type ?? 'paragraph') : 'paragraph';
	const titleTextStyle = {
		color: textColor,
		fontSize: styles.criteriaTitle.fontSize + fontSizeOffset,
	};
	const hintTextStyle = {
		color: textColor,
		fontSize: styles.lockedHint.fontSize + fontSizeOffset,
	};
	const criteriaTextStyle = {
		color: textColor,
		fontSize: styles.criteriaText.fontSize + fontSizeOffset,
		lineHeight: styles.criteriaText.lineHeight + fontSizeOffset,
	};
	const criteria = unlockCriteria.map(criterion => ({
		isUnlocked: criterion.isUnlocked,
		label: formatUnlockCriterion(criterion),
	}));

	async function handleUnlock() {
		if (!itemId || isUnlocking || isUpdatingProgress) {
			return;
		}
		setIsUnlocking(true);
		const didUnlock = await unlockItem(itemId);
		setIsUnlocking(false);
		if (!didUnlock) {
			Alert.alert('Could not unlock yet', 'Please try again.');
		}
	}

	function showRequirements() {
		Alert.alert('Unlock requirements', criteria.map(criterion => criterion.label).join('\n\n'));
	}

	if (circular) {
		let label = 'Locked';

		if (isReady) {
			label = `Unlock ${itemType}`;
		}

		if (isUnlocking) {
			label = 'Unlocking…';
		}

		return (
			<Pressable
				style={[styles.circularControl, style]}
				onPress={isReady ? handleUnlock : showRequirements}
				disabled={!canShowRequirements || isUpdatingProgress || isUnlocking}
				accessibilityLabel={`${label}: ${itemType}`}
				accessibilityRole="button"
			>
				{({ pressed }) => (
					<>
						<View
							style={[styles.lockCircle, { borderColor: color }, pressed && styles.pressedCircle]}
						>
							<MaterialSymbol
								name={isReady ? 'lock_open' : 'lock'}
								color={color}
								size={32}
							/>
						</View>
						<Text style={[styles.circularLabel, { color, fontSize: 12 + fontSizeOffset }]}>
							{label}
						</Text>
					</>
				)}
			</Pressable>
		);
	}

	if (!canShowRequirements) {
		return (
			<View style={[styles.section, { borderColor: color }, style]}>
				<MaterialSymbol
					color={color}
					size={24}
					name="lock"
				/>
				<Text style={[styles.criteriaTitle, titleTextStyle]}>Locked</Text>
				<Text style={[styles.lockedHint, hintTextStyle]}>Level up to unlock!</Text>
			</View>
		);
	}

	return (
		<View style={[styles.section, { borderColor: color }, style]}>
			<MaterialSymbol
				color={color}
				size={24}
				name={isReady ? 'lock_open' : 'lock'}
			/>
			<View style={styles.criteria}>
				<Text style={[styles.criteriaTitle, titleTextStyle]}>
					{isReady ? 'Ready to unlock!' : 'Complete the following to unlock:'}
				</Text>
				{isReady ?
					<LinkButton
						handler={handleUnlock}
						disabled={isUpdatingProgress}
						color={color}
						useArrow={false}
					>
						<Text style={{ fontSize: 14 + fontSizeOffset }}>
							{isUnlocking ? 'Unlocking…' : `Unlock ${itemType}`}
						</Text>
					</LinkButton>
				:	criteria.map(({ label, isUnlocked }, index) => (
						<Text
							key={`${label}-${index}`}
							style={[styles.criteriaText, criteriaTextStyle, isUnlocked && styles.criteriaMet]}
						>
							{label}
						</Text>
					))
				}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	circularControl: {
		alignItems: 'center',
		gap: 4,
	},
	lockCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		borderWidth: 2,
		backgroundColor: `${colors.dark.background}CC`,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressedCircle: {
		opacity: 0.65,
	},
	circularLabel: {
		fontFamily: 'lexend-600',
		fontSize: 12,
		textAlign: 'center',
	},
	section: {
		alignItems: 'center',
		justifyContent: 'center',
		borderStyle: 'dashed',
		borderWidth: 1,
		paddingVertical: 6,
		paddingHorizontal: 6,
	},
	criteria: {
		alignSelf: 'stretch',
		flexShrink: 1,
		marginVertical: 8,
		padding: 8,
		gap: 4,
	},
	criteriaTitle: {
		textAlign: 'center',
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	lockedHint: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		marginTop: 4,
	},
	criteriaText: {
		flexShrink: 1,
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 22,
		textAlign: 'center',
	},
	criteriaMet: {
		textDecorationLine: 'line-through',
	},
});
