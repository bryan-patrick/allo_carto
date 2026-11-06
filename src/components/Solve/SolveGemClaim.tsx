import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';
import SolveRewardClaimButton from './SolveRewardClaimButton';
import type { SolveReward, SolveRewardReceipt } from './solveTypes';

interface SolveGemClaimProps {
	deckId: string;
	reward: SolveReward;
	disabled: boolean;
	onClaimed: (reward: SolveReward) => void;
}

// Let the player claim the finished puzzle's gem and open its paragraph after a new claim.
export default function SolveGemClaim({ deckId, reward, disabled, onClaimed }: SolveGemClaimProps) {
	function handleClaimed(claimedReward: SolveReward, status: SolveRewardReceipt['status']) {
		if (status === 'claimed') {
			onClaimed(claimedReward);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Puzzle solved!</Text>
			<Text style={styles.text}>Claim your gem and {reward.xp} XP.</Text>
			<SolveRewardClaimButton
				deckId={deckId}
				reward={reward}
				disabled={disabled}
				onClaimed={handleClaimed}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		gap: 12,
		padding: 12,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
		textAlign: 'center',
	},
	text: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
		textAlign: 'center',
	},
});
