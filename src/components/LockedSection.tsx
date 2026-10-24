import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import {
	formatUnlockCriterion,
	isItemReadyToUnlock,
	type UnlockCriteria,
} from '@/src/util/atlasCompletion';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import LinkButton from './LinkButton';
import MaterialSymbol from './MaterialSymbol';

interface LockedSectionProps {
	color?: string;
	textColor?: string;
	unlockCriteria: UnlockCriteria[];
	itemId?: string;
}

/**
 * Explains how to unlock a story, chapter, or deck.
 */
export default function LockedSection({
	color = colors.utility.cardBorder,
	textColor = colors.dark.text,
	unlockCriteria,
	itemId,
}: LockedSectionProps) {
	const { experience, progressById, isUpdatingProgress, unlockItem } = useUserProgress();
	const [isUnlocking, setIsUnlocking] = useState(false);
	const isReady = Boolean(
		itemId && isItemReadyToUnlock({ id: itemId, progressById, userLevel: experience.level }),
	);
	const itemType = itemId ? (progressById[itemId]?.type ?? 'deck') : 'deck';
	const textStyle = { color: textColor };
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

	return (
		<View style={[styles.section, { borderColor: color }]}>
			<MaterialSymbol
				color={color}
				size={24}
				name={isReady ? 'lock_open' : 'lock'}
			/>
			<View style={styles.criteria}>
				<Text style={[styles.criteriaTitle, textStyle]}>
					{isReady ? 'Ready to unlock!' : 'Complete the following to unlock:'}
				</Text>
				{isReady ?
					<LinkButton
						handler={handleUnlock}
						disabled={isUpdatingProgress}
						color={color}
						useArrow={false}
					>
						{isUnlocking ? 'Unlocking…' : `Unlock ${itemType}`}
					</LinkButton>
				:	criteria.map(({ label, isUnlocked }, index) => (
						<Text
							key={`${label}-${index}`}
							style={[styles.criteriaText, textStyle, isUnlocked && styles.criteriaMet]}
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
