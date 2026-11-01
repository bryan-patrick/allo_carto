import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';
import SolveRewardClaimButton from './SolveRewardClaimButton';
import type { SolveReward } from './solveTypes';

interface SolveGemClaimProps {
	deckId: string;
	reward: SolveReward;
	disabled: boolean;
}

// Keep the finished puzzle's gem hidden until its XP is claimed.
export default function SolveGemClaim({ deckId, reward, disabled }: SolveGemClaimProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Puzzle solved!</Text>
			<Text style={styles.text}>Claim your gem and {reward.xp} XP.</Text>
			<SolveRewardClaimButton
				deckId={deckId}
				reward={reward}
				disabled={disabled}
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
