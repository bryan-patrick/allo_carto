import colors from '@/src/app/colors';
import type { DeckSessionProps } from '@/src/components/CardDeck/deckSessionTypes';
import CountUp from '@/src/components/CountUp';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { inkConfig } from '@/src/util/ink';
import { StyleSheet, Text, View } from 'react-native';
import CompletionXPProgress from './CompletionXPProgress';

/**
 * Typing
 */
interface CompletionRewardsProps {
	session: DeckSessionProps;
	color: string;
	inkBalance: number;
}

/**
 * Shows the current flashcard study session totals
 */
export default function CompletionRewards({ session, color, inkBalance }: CompletionRewardsProps) {
	const { completion, results } = session;
	const correctResults = results.filter(result => result.outcome === 'correct');
	const skippedResults = results.filter(result => result.outcome === 'skipped');
	const correctCount = correctResults.length;
	const studiedCount = results.length;
	const skippedCount = skippedResults.length;
	const wordXP = results.reduce((total, result) => total + result.xp, 0);
	const bonusXP = completion?.bonuses.reduce((total, bonus) => total + bonus.xp, 0) ?? 0;
	const earnedXP = wordXP + bonusXP;
	const accentStyle = { color };
	const earnedInk = completion?.earnedInk ?? 0;
	const isInkFull = inkBalance >= inkConfig.maxBalance;
	let balanceLabel = `You have: ${inkBalance.toLocaleString()} / ${inkConfig.maxBalance}`;
	let inkDescription = `Earned ${earnedInk} Ink. ${balanceLabel} Ink.`;

	if (isInkFull) {
		balanceLabel += ' - Full';
		inkDescription += ' Ink is full. Correct answers still earn XP.';
	}

	if (!completion) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View
				accessible
				accessibilityLabel={inkDescription}
				style={styles.inkReward}
			>
				<MaterialSymbol
					name="water_drop"
					size={32}
					color={color}
				/>
				<View style={styles.inkAmount}>
					<CountUp
						value={earnedInk}
						duration={500}
						prefix="+"
						style={[styles.amount, accentStyle]}
					/>
					<Text style={styles.label}>Ink earned</Text>
				</View>
				<Text style={[styles.label, isInkFull && styles.fullInkBalance]}>{balanceLabel}</Text>
			</View>
			<View style={styles.totals}>
				<View style={styles.total}>
					<Text style={[styles.amount, accentStyle]}>
						{correctCount} / {studiedCount}
					</Text>
					<Text style={styles.label}>Correct</Text>
					{skippedCount > 0 && <Text style={styles.note}>{skippedCount} skipped</Text>}
				</View>
				<View style={styles.total}>
					<CountUp
						value={earnedXP}
						duration={500}
						prefix="+"
						style={[styles.amount, accentStyle]}
					/>
					<Text style={styles.label}>XP earned</Text>
					{bonusXP > 0 && <Text style={styles.note}>Includes {bonusXP} bonus XP</Text>}
				</View>
			</View>
			<CompletionXPProgress
				fromXP={session.xpBefore}
				toXP={completion.totalXP}
				delay={0}
				color={color}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: { gap: 16 },
	inkReward: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		backgroundColor: `${colors.light.secondary}55`,
	},
	inkAmount: { flex: 1, gap: 4 },
	fullInkBalance: {
		backgroundColor: colors.ink.full,
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 6,
	},
	totals: { flexDirection: 'row', gap: 12 },
	total: {
		flex: 1,
		gap: 4,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		backgroundColor: `${colors.light.secondary}55`,
	},
	amount: { fontFamily: 'lexend-600', fontSize: 26, color: colors.dark.text },
	label: { fontFamily: 'lexend-400', fontSize: 12, color: colors.dark.text },
	note: { fontFamily: 'lexend-400', fontSize: 11, lineHeight: 16, color: colors.dark.text },
});
