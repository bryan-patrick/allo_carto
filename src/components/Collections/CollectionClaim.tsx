import colors from '@/src/app/colors';
import {
	useSolveXPFeedback,
	type SolveXPFeedbackOrigin,
} from '@/src/components/Solve/SolveXPFeedback';
import type { CollectionRewardReceipt } from '@/src/db/queries/claimCollectionReward';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import LinkButton from '../LinkButton';

interface CollectionClaimProps {
	progress: VocabularyCollectionProgress;
}

/*
 * Gets a message explaining the result of a collection reward claim.
 */
function getClaimFeedback(receipt: CollectionRewardReceipt): string {
	const responses: Record<CollectionRewardReceipt['status'], string> = {
		claimed: '',
		alreadyClaimed: 'This reward has already been claimed.',
		notReady: 'Keep practicing: every word needs to reach this learning level.',
	};

	return responses[receipt.status];
}

// Show the next available collection reward and float its XP after a successful claim.
export default function CollectionClaim({ progress }: CollectionClaimProps) {
	const { claimCollectionReward, isUpdatingProgress } = useUserProgress();
	const showXPFeedback = useSolveXPFeedback();
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

	async function claimReward(event: GestureResponderEvent) {
		const feedbackOrigin: SolveXPFeedbackOrigin = {
			centerX: event.nativeEvent.pageX,
			top: event.nativeEvent.pageY,
		};

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

		if (receipt.status === 'claimed') {
			showXPFeedback({
				...feedbackOrigin,
				xp: receipt.xp,
			});
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
					onPress={claimReward}
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
