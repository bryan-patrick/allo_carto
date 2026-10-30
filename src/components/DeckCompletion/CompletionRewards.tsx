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
	newFlashcardsSeen: number;
	seenFlashcards: number;
	totalFlashcards: number;
}

/**
 * List the session's Ink, new flashcards, and XP above the player's level progress.
 */
export default function CompletionRewards({
	session,
	color,
	inkBalance,
	newFlashcardsSeen,
	seenFlashcards,
	totalFlashcards,
}: CompletionRewardsProps) {
	const { completion, results } = session;
	const wordXP = results.reduce((total, result) => total + result.xp, 0);
	const bonusXP = completion?.bonuses.reduce((total, bonus) => total + bonus.xp, 0) ?? 0;
	const paragraphBonus = completion?.bonuses.find(bonus => bonus.kind === 'paragraphCompletion');
	const earnedXP = wordXP + bonusXP;
	const accentStyle = {
		color,
	};
	const earnedInk = completion?.earnedInk ?? 0;
	const isInkFull = inkBalance >= inkConfig.maxBalance;
	let balanceDescription = `Ink balance: ${inkBalance} of ${inkConfig.maxBalance}.`;

	if (isInkFull) {
		balanceDescription += ' Ink is full. Correct answers still earn XP.';
	}

	if (!completion) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View>
				<View
					accessible
					accessibilityLabel={`Earned ${earnedInk} Ink. ${balanceDescription}`}
					style={styles.row}
				>
					<View style={styles.rowLabel}>
						<MaterialSymbol
							name="water_drop"
							size={18}
							color={color}
						/>
						<Text style={styles.label}>
							Ink earned ({inkBalance}/{inkConfig.maxBalance})
						</Text>
					</View>
					<CountUp
						value={earnedInk}
						duration={500}
						prefix="+"
						style={[styles.amount, accentStyle]}
					/>
				</View>
				<View style={styles.row}>
					<View style={styles.rowDetails}>
						<Text style={styles.label}>New flashcards seen</Text>
					</View>
					<Text
						style={[styles.amount, accentStyle]}
						accessibilityLabel={`${newFlashcardsSeen} new flashcards seen this session. ${seenFlashcards} of ${totalFlashcards} flashcards seen in this paragraph.`}
					>
						{newFlashcardsSeen} ({seenFlashcards}/{totalFlashcards})
					</Text>
				</View>
				{paragraphBonus && (
					<View style={styles.row}>
						<View style={styles.rowDetails}>
							<Text style={styles.label}>Paragraph completion bonus</Text>
						</View>
						<CountUp
							value={paragraphBonus.xp}
							duration={500}
							prefix="+"
							suffix=" XP"
							style={[styles.amount, accentStyle]}
						/>
					</View>
				)}
				<View style={styles.row}>
					<View style={styles.rowDetails}>
						<Text style={styles.label}>XP earned</Text>
						{bonusXP > 0 && <Text style={styles.note}>{bonusXP} bonus XP</Text>}
					</View>
					<CountUp
						value={earnedXP}
						duration={500}
						prefix="+"
						style={[styles.amount, accentStyle]}
					/>
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
	container: {
		gap: 8,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.border,
	},
	rowLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	rowDetails: {
		flex: 1,
		gap: 2,
	},
	amount: {
		fontFamily: 'lexend-600',
		fontSize: 16,
		color: colors.dark.text,
	},
	label: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	note: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		lineHeight: 14,
		color: colors.dark.text,
	},
});
