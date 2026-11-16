import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import { useRef, useState } from 'react';
import {
	Animated,
	Pressable,
	StyleSheet,
	Text,
	View,
	type GestureResponderEvent,
} from 'react-native';
import { useSolveXPFeedback, type SolveXPFeedback } from './SolveXPFeedback';
import type { SolveReward, SolveRewardReceipt } from './solveTypes';

/**
 * Typing
 */
interface SolveRewardClaimButtonProps {
	deckId: string;
	reward: SolveReward;
	disabled?: boolean;
	onClaimed?: (reward: SolveReward, status: SolveRewardReceipt['status']) => void;
}

/**
 * Shows an animated claim button that awards saved puzzle XP and displays the earned amount.
 */
export default function SolveRewardClaimButton({
	deckId,
	reward,
	disabled = false,
	onClaimed,
}: SolveRewardClaimButtonProps) {
	/**
	 * Progress and reward feedback hooks
	 */
	const { claimSolveReward, isUpdatingProgress } = useUserProgress();
	const showXPFeedback = useSolveXPFeedback();

	/**
	 * Claim state
	 */
	const [isClaiming, setIsClaiming] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const isBusy = useRef(false);

	/**
	 * Button availability and movement
	 */
	const isDisabled = disabled || isClaiming || isUpdatingProgress;
	const animatedStyle = useButtonWiggle(!isDisabled);

	/**
	 * Initial button text and screen reader description
	 */
	let label = 'Claim!';
	let accessibilityLabel = `Claim ${reward.xp} XP`;

	if (isClaiming) {
		label = 'Claiming...';
		accessibilityLabel = label;
	}

	/**
	 * Claims the puzzle reward and shows its XP after a successful save.
	 */
	async function handleClaim(event: GestureResponderEvent) {
		const feedbackOrigin: Pick<SolveXPFeedback, 'centerX' | 'top'> = {
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

			onClaimed?.(receipt.reward, receipt.status);
		} finally {
			isBusy.current = false;
			setIsClaiming(false);
		}
	}

	return (
		<View style={styles.container}>
			{/* Reserve the button's space so its movement cannot resize the card. */}
			<View style={styles.buttonSpace}>
				<Animated.View style={[styles.animatedButton, animatedStyle]}>
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
				</Animated.View>
			</View>
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

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		gap: 4,
	},
	buttonSpace: {
		width: 96,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	animatedButton: {
		position: 'absolute',
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
