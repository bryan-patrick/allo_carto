import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import type { FrenchTip } from '@/src/components/Tips/tipTypes';
import type { TipRewardReceipt } from '@/src/db/queries/tipRewards';
import { useUserProgress } from '@/src/db/useUserProgress';
import { userExperienceConfig } from '@/src/util/userExperience';
import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface TipRewardClaimProps {
	tip: FrenchTip;
}

interface SaveTipRewardOptions {
	tipId: string;
	claimTipReward: (tipId: string) => Promise<TipRewardReceipt | false>;
	setClaimFeedback: Dispatch<SetStateAction<string>>;
}

/**
 * Claims a tip's XP and shows a message if the save fails.
 */
async function saveTipReward({
	tipId,
	claimTipReward,
	setClaimFeedback,
}: SaveTipRewardOptions): Promise<void> {
	setClaimFeedback('');

	const receipt = await claimTipReward(tipId);

	if (!receipt) {
		setClaimFeedback('Could not save your reward. Please try again.');
	}
}

/**
 * Shows a tip's XP claim button or that it has been claimed.
 */
export default function TipRewardClaim({ tip }: TipRewardClaimProps) {
	/**
	 * Saved progress and feedback state
	 */
	const { tips, tipClaims, claimTipReward, isUpdatingProgress, status, reloadProgress } =
		useUserProgress();
	const [claimFeedback, setClaimFeedback] = useState('');

	/**
	 * Claim availability
	 */
	const savedClaim = tipClaims.find(claim => claim.tipId === tip.id);
	const tipProgress = tips.find(progress => progress.tip.id === tip.id);
	const canClaimTipReward =
		tipProgress?.isXPRewardReadyToClaim === true && !isUpdatingProgress && status === 'ready';

	/**
	 * Initial display values
	 */
	let actionLabel = `Claim +${userExperienceConfig.tipXP} XP`;
	let claimContent: ReactNode = null;

	if (isUpdatingProgress) {
		actionLabel = 'Saving...';
	}

	claimContent = (
		<LinkButton
			accessibilityRole="button"
			accessibilityLabel={`Claim ${userExperienceConfig.tipXP} XP for ${tip.title}`}
			disabled={!canClaimTipReward}
			handler={() =>
				saveTipReward({
					tipId: tip.id,
					claimTipReward,
					setClaimFeedback,
				})
			}
			useArrow={false}
			style={!canClaimTipReward && styles.disabledButton}
		>
			{actionLabel}
		</LinkButton>
	);

	if (savedClaim) {
		claimContent = (
			<Text
				accessibilityLiveRegion="polite"
				style={styles.claimed}
			>
				{savedClaim.xp} XP claimed
			</Text>
		);
	}

	return (
		<View style={styles.container}>
			{claimContent}
			{claimFeedback !== '' && (
				<Text
					accessibilityLiveRegion="polite"
					style={styles.feedback}
				>
					{claimFeedback}
				</Text>
			)}
			{status === 'error' && (
				<>
					<Text style={styles.feedback}>Could not load your tip progress. Please try again.</Text>
					<LinkButton handler={reloadProgress}>Try again</LinkButton>
				</>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		gap: 8,
		marginTop: 24,
		width: '100%',
	},
	claimed: {
		color: colors.dark.success,
		fontFamily: 'lexend-600',
		fontSize: 16,
		textAlign: 'center',
	},
	feedback: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
		textAlign: 'center',
	},
	disabledButton: {
		opacity: 0.5,
	},
});
