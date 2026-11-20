import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SolveRewardClaimButton from './SolveRewardClaimButton';
import type { SolveReward, SolveWordOrderCard } from './solveTypes';

interface WordOrderClaimsProps {
	deckId: string;
	cards: SolveWordOrderCard[];
	positions: number[];
	rewards: SolveReward[];
	disabled: boolean;
	onRewardClaimed: (reward: SolveReward) => void;
}

/**
 * Shows solved cards with XP claims or checkmarks for words that need no claim.
 */
export default function WordOrderClaims({
	deckId,
	cards,
	positions,
	rewards,
	disabled,
	onRewardClaimed,
}: WordOrderClaimsProps) {
	/**
	 * Cards in the accepted sentence order
	 */
	const cardsById = new Map(cards.map(card => [card.id, card]));

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.grid}
			bounces={false}
			overScrollMode="never"
		>
			{positions.map(cardId => {
				const card = cardsById.get(cardId);
				const reward = rewards.find(saved => saved.kind === 'card' && saved.position === cardId);
				const hasPendingReward = reward?.claimedAt === null;
				const shouldShowCheckmark = !hasPendingReward;

				if (!card) {
					return null;
				}

				return (
					<View
						key={cardId}
						style={styles.card}
					>
						<Text style={styles.word}>{card.text}</Text>
						{hasPendingReward && reward && (
							<SolveRewardClaimButton
								deckId={deckId}
								reward={reward}
								disabled={disabled}
								onClaimed={onRewardClaimed}
							/>
						)}
						{shouldShowCheckmark && (
							<View style={styles.cardStatus}>
								<MaterialSymbol
									name="check"
									size={22}
									color={colors.dark.text}
								/>
							</View>
						)}
					</View>
				);
			})}
		</ScrollView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		padding: 12,
	},
	card: {
		width: '30%',
		flexGrow: 1,
		maxWidth: 140,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: colors.dark.success,
		borderRadius: 8,
		backgroundColor: colors.light.success,
		padding: 8,
		gap: 8,
	},
	word: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
		textAlign: 'center',
	},
	cardStatus: {
		minHeight: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
