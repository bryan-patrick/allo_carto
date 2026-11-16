import colors from '@/src/app/colors';
import { useSolveXPFeedback, type SolveXPFeedback } from '@/src/components/Solve/SolveXPFeedback';
import type { CollectionRewardReceipt } from '@/src/db/queries/claimCollectionReward';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import LinkButton from '../LinkButton';

/**
 * Typing
 */
interface CollectionClaimProps {
	progress: VocabularyCollectionProgress;
}

/**
 * Gets a message explaining the result of a user claiming a collection XP reward
 */
function getClaimFeedback(receipt: CollectionRewardReceipt): string {
	const responses: Record<CollectionRewardReceipt['status'], string> = {
		claimed: '',
		alreadyClaimed: 'This reward has already been claimed.',
		notReady: 'Keep practicing: every word needs to reach this learning level.',
	};

	return responses[receipt.status];
}

/**
 * Show the next available collection XP reward and save it when the player claims it.
 * After that show the XP animated floating text
 */
export default function CollectionClaim({ progress }: CollectionClaimProps) {
	/**
	 * Saved progress, XP feedback, and settings hooks
	 */
	const { claimCollectionReward, isUpdatingProgress } = useUserProgress();
	const showXPFeedback = useSolveXPFeedback();
	const { settings } = useAppSettings();

	/**
	 * State
	 */
	const [claimFeedback, setClaimFeedback] = useState('');

	/**
	 * Destructured collection progress
	 */
	const { nextReward } = progress;

	/**
	 * Reward readiness and claim availability
	 */
	const isNextXPRewardReadyToClaim = Boolean(nextReward?.isEligible);
	const canClaimReward =
		isNextXPRewardReadyToClaim && !isUpdatingProgress && !settings.previewAllStamps;

	/**
	 * Initial button text
	 */
	let actionLabel = '';

	/**
	 * Initial screen reader descriptions
	 */
	let claimAccessibilityLabel = '';
	let claimAccessibilityHint: string | undefined = undefined;

	/**
	 * Explain how to enable claims when all stamps are revealed in Settings.
	 */
	if (settings.previewAllStamps) {
		claimAccessibilityHint = 'Turn off Reveal all stamps in Settings to claim rewards.';
	}

	/**
	 * Build the claim button's text when the next reward is ready.
	 */
	if (nextReward?.isEligible) {
		actionLabel = `Claim +${nextReward.xp} XP`;
		claimAccessibilityLabel = `Claim ${nextReward.xp} XP for collection learning level ${nextReward.level}`;

		if (isUpdatingProgress) {
			actionLabel = 'Saving...';
		}
	}

	/**
	 * Save the collection reward and show the result.
	 * Also stores the position so the earned XP appears near the claim button.
	 */
	async function claimReward(event: GestureResponderEvent) {
		/**
		 * Tap position for the XP animation
		 */
		const feedbackOrigin: SolveXPFeedback = {
			centerX: event.nativeEvent.pageX,
			top: event.nativeEvent.pageY,
		};

		if (!nextReward || !canClaimReward) {
			return;
		}

		/**
		 * Clear the old message and save the reward.
		 */
		setClaimFeedback('');

		const receipt = await claimCollectionReward({
			collectionId: progress.collection.id,
			requiredWordProgress: nextReward.requiredWordProgress,
		});

		if (!receipt) {
			setClaimFeedback('Could not save your reward. Please try again.');
			return;
		}

		/**
		 * Float the XP on claim
		 */
		if (receipt.status === 'claimed') {
			showXPFeedback({
				...feedbackOrigin,
				xp: receipt.xp,
			});
		}

		setClaimFeedback(getClaimFeedback(receipt));
	}

	/**
	 * Hide this section when there is no ready reward or claim message.
	 */
	if (!isNextXPRewardReadyToClaim && claimFeedback === '') {
		return null;
	}

	/**
	 * Render the thing
	 */
	return (
		<View style={styles.container}>
			{isNextXPRewardReadyToClaim && (
				<LinkButton
					onPress={claimReward}
					disabled={!canClaimReward}
					useArrow={false}
					color={colors.dark.primary}
					accessibilityLabel={claimAccessibilityLabel}
					accessibilityHint={claimAccessibilityHint}
				>
					{actionLabel}
				</LinkButton>
			)}
			{claimFeedback !== '' && (
				<Text
					accessibilityLiveRegion="polite"
					style={styles.feedback}
				>
					{claimFeedback}
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
		gap: 8,
	},
	feedback: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.success,
	},
});
