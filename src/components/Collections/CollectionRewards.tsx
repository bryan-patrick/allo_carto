import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import type { CollectionRewardReceipt } from '@/src/db/queries/claimCollectionReward';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinkButton from '../LinkButton';
import MaterialSymbol from '../MaterialSymbol';

interface CollectionRewardsProps {
	progress: VocabularyCollectionProgress;
}

/**
 * Gets a message explaining the result of a collection reward claim.
 */
function getClaimFeedback(receipt: CollectionRewardReceipt): string {
	const responses: Record<CollectionRewardReceipt['status'], string> = {
		claimed: `Claimed +${receipt.xp} XP!`,
		alreadyClaimed: 'This reward has already been claimed.',
		notReady: 'Keep practicing: every word needs to reach this learning level.',
	};

	return responses[receipt.status];
}

/**
 * Shows collection XP rewards and lets the player claim the next eligible level.
 */
export default function CollectionRewards({ progress }: CollectionRewardsProps) {
	const { claimCollectionReward, isUpdatingProgress } = useUserProgress();
	const [feedback, setFeedback] = useState('');
	const nextReward = progress.nextReward;
	const canClaim = Boolean(nextReward?.isEligible) && !isUpdatingProgress;
	let actionLabel = 'Locked';

	if (!nextReward) {
		actionLabel = 'All rewards claimed';
	} else if (nextReward.isEligible) {
		actionLabel = isUpdatingProgress ? 'Saving…' : `Claim +${nextReward.xp} XP`;
	}

	async function claimReward() {
		if (!nextReward || !canClaim) {
			return;
		}

		setFeedback('');

		const receipt = await claimCollectionReward({
			collectionId: progress.collection.id,
			requiredWordProgress: nextReward.requiredWordProgress,
		});

		if (!receipt) {
			setFeedback('Could not save your reward. Please try again.');
			return;
		}

		setFeedback(getClaimFeedback(receipt));
	}

	return (
		<View style={styles.panel}>
			<Text style={styles.title}>Collection Rewards</Text>
			{progress.rewards.map(reward => (
				<View
					key={reward.requiredWordProgress}
					style={styles.rewardRow}
				>
					<MaterialSymbol
						name={
							reward.isClaimed ? 'check_circle'
							: reward.isEligible ?
								'redeem'
							:	'lock'
						}
						size={20}
						color={colors.wordProgress.unseen}
					/>
					<Text style={styles.rewardLevel}>Lvl. {reward.level}</Text>
					<Text style={styles.rewardXP}>+{reward.xp} XP</Text>
					<Text style={styles.rewardStatus}>
						{reward.isClaimed ?
							'Claimed'
						: reward.isEligible ?
							'Ready'
						:	'Locked'}
					</Text>
				</View>
			))}
			{nextReward && (
				<Text style={styles.hint}>
					Reach Lvl. {nextReward.level} on every word to claim its reward.
				</Text>
			)}
			<LinkButton
				handler={claimReward}
				disabled={!canClaim}
				useArrow={false}
				color={canClaim ? colors.dark.primary : colors.light.border}
				accessibilityLabel={actionLabel}
			>
				{actionLabel}
			</LinkButton>
			{feedback !== '' && (
				<Text
					accessibilityLiveRegion="polite"
					style={styles.feedback}
				>
					{feedback}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	panel: {
		gap: 12,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 12,
		padding: 16,
		backgroundColor: colors.light.secondary,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 19,
		color: colors.dark.text,
	},
	rewardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
	},
	rewardLevel: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.text,
	},
	rewardXP: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		color: colors.dark.text,
		flexGrow: 1,
	},
	rewardStatus: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		color: colors.wordProgress.unseen,
	},
	hint: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
		color: colors.wordProgress.unseen,
	},
	feedback: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.success,
	},
});
