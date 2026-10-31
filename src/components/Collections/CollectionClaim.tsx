import colors from '@/src/app/colors';
import type { CollectionRewardReceipt } from '@/src/db/queries/claimCollectionReward';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinkButton from '../LinkButton';

interface CollectionClaimProps {
	progress: VocabularyCollectionProgress;
}

/*
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

/*
 * Shows the next XP claim below the progress bar when its learning level is ready.
 */
export default function CollectionClaim({ progress }: CollectionClaimProps) {
	const { claimCollectionReward, isUpdatingProgress } = useUserProgress();
	const { settings } = useAppSettings();
	const [feedback, setFeedback] = useState('');
	const nextReward = progress.nextReward;
	const canClaim =
		Boolean(nextReward?.isEligible) && !isUpdatingProgress && !settings.previewAllStamps;
	const claimAccessibilityHint =
		settings.previewAllStamps ?
			'Turn off Reveal all stamps in Settings to claim rewards.'
		:	undefined;
	let actionLabel = '';

	if (nextReward?.isEligible) {
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

	if (!nextReward?.isEligible && feedback === '') {
		return null;
	}

	return (
		<View style={styles.container}>
			{nextReward?.isEligible && (
				<LinkButton
					handler={claimReward}
					disabled={!canClaim}
					useArrow={false}
					color={colors.dark.primary}
					accessibilityLabel={`Claim ${nextReward.xp} XP for collection learning level ${nextReward.level}`}
					accessibilityHint={claimAccessibilityHint}
				>
					{actionLabel}
				</LinkButton>
			)}
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
	container: {
		gap: 8,
	},
	feedback: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.success,
	},
});
