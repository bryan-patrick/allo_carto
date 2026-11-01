import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useSolveXPFeedback, type SolveXPFeedbackOrigin } from './SolveXPFeedback';
import type { SolveReward } from './solveTypes';

/*
 * Typing
 */
interface SolveRewardClaimButtonProps {
	deckId: string;
	reward: SolveReward;
	disabled?: boolean;
	onClaimed?: (reward: SolveReward) => void;
}

/*
 * Claim saved puzzle XP and show the earned amount above the button after a successful save.
 * Keep the button available if the save needs another try.
 */
export default function SolveRewardClaimButton({
	deckId,
	reward,
	disabled = false,
	onClaimed,
}: SolveRewardClaimButtonProps) {
	const { claimSolveReward, isUpdatingProgress } = useUserProgress();
	const showXPFeedback = useSolveXPFeedback();
	const [isClaiming, setIsClaiming] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const isBusy = useRef(false);
	const isDisabled = disabled || isClaiming || isUpdatingProgress;
	const label = isClaiming ? 'Claiming…' : 'Claim!';
	const accessibilityLabel = isClaiming ? label : `Claim ${reward.xp} XP`;

	async function handleClaim(event: GestureResponderEvent) {
		const feedbackOrigin: SolveXPFeedbackOrigin = {
			centerX: event.nativeEvent.pageX,
			top: event.nativeEvent.pageY,
		};

		if (isDisabled || isBusy.current) {
			return;
		}

		isBusy.current = true;
		setIsClaiming(true);
		setErrorMessage('');

		try {
			const receipt = await claimSolveReward({
				deckId,
				stage: reward.stage,
				kind: reward.kind,
				position: reward.position,
			});

			if (!receipt || !receipt.reward) {
				setErrorMessage('Could not claim. Please try again.');
				return;
			}

			if (receipt.status === 'claimed') {
				showXPFeedback({
					...feedbackOrigin,
					xp: receipt.reward.xp,
				});
			}

			onClaimed?.(receipt.reward);
		} finally {
			isBusy.current = false;
			setIsClaiming(false);
		}
	}

	return (
		<View style={styles.container}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityState={{
					busy: isClaiming,
					disabled: isDisabled,
				}}
				disabled={isDisabled}
				onPress={handleClaim}
				style={({ pressed }) => [
					styles.button,
					pressed && styles.pressed,
					isDisabled && styles.disabled,
				]}
			>
				<Text style={styles.label}>{label}</Text>
				{!isClaiming && <Text style={styles.xp}>+{reward.xp} XP</Text>}
			</Pressable>
			{Boolean(errorMessage) && (
				<Text
					accessibilityLiveRegion="polite"
					style={styles.error}
				>
					{errorMessage}
				</Text>
			)}
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		gap: 4,
	},
	button: {
		justifyContent: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		backgroundColor: colors.dark.primary,
	},
	pressed: {
		backgroundColor: colors.dark.primaryActive,
	},
	disabled: {
		opacity: 0.5,
	},
	label: {
		color: colors.light.text,
		fontFamily: 'lexend-700',
		textAlign: 'center',
		fontSize: 14,
	},
	xp: {
		color: colors.light.text,
		fontFamily: 'lexend-400',
		fontSize: 11,
		textAlign: 'center',
	},
	error: {
		color: colors.dark.danger,
		fontFamily: 'lexend-400',
		fontSize: 11,
		textAlign: 'center',
	},
});
