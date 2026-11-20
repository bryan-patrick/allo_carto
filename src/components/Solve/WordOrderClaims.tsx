import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { ScrollView, StyleSheet, Text, View, type ViewProps } from 'react-native';
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
				let importantForAccessibility: ViewProps['importantForAccessibility'] = 'auto';

				if (!card) {
					return null;
				}

				if (hasPendingReward) {
					importantForAccessibility = 'no-hide-descendants';
				}

				return (
					<View
						key={cardId}
						style={styles.card}
					>
						<View
							accessibilityElementsHidden={hasPendingReward}
							importantForAccessibility={importantForAccessibility}
							style={[styles.cardTextArea, hasPendingReward && styles.hiddenCardContent]}
						>
							<Text style={styles.word}>{card.text}</Text>
						</View>
						{/* Match the drag handle's space so claiming XP keeps the card the same size. */}
						<View style={styles.cardStatus}>
							{shouldShowCheckmark && (
								<MaterialSymbol
									name="check"
									size={22}
									color={colors.dark.text}
								/>
							)}
						</View>
						{hasPendingReward && reward && (
							<View style={styles.claimOverlay}>
								<SolveRewardClaimButton
									deckId={deckId}
									reward={reward}
									disabled={disabled}
									onClaimed={onRewardClaimed}
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
		maxWidth: 120,
		minHeight: 78,
		alignItems: 'center',
		borderWidth: 2,
		borderColor: colors.dark.success,
		borderRadius: 8,
		backgroundColor: colors.light.success,
	},
	cardTextArea: {
		flex: 1,
		marginTop: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hiddenCardContent: {
		opacity: 0,
	},
	claimOverlay: {
		...StyleSheet.absoluteFill,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.light.background,
		borderColor: colors.dark.border,
		borderRadius: 4,
		borderWidth: 1,
		margin: 2,
		padding: 2,
	},
	word: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
		textAlign: 'center',
	},
	cardStatus: {
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
