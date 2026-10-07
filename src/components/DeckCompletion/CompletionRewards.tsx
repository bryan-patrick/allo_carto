import colors from '@/src/app/colors';
import type { DeckSessionProps, XPBonusProps } from '@/src/components/CardDeck/deckSessionTypes';
import { countUpDuration } from '@/src/components/CountUp';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import CompletionXPAmount from './CompletionXPAmount';
import CompletionXPProgress from './CompletionXPProgress';
import {
	completionEntryDuration,
	getCompletionDelay,
	getCompletionEntry,
} from './completionAnimations';

/**
 * Information needed to show the rewards.
 */
interface CompletionRewardsProps {
	session: DeckSessionProps;
	color: string;
}

interface ReceiptBonusProps {
	id: string;
	xp: number;
	label: string;
}

/**
 * Show the words first, then bonuses, then the total
 * Each bonus gets one turn to appear and one turn to count its XP
 */
const animationOrder = {
	word: 1,
	wordXP: 2,
	bonus: 3,
	bonusXP: 4,
	firstBonusRow: 5,
};
const animationsPerBonus = 2;
const xpCountOffset = 1;
const progressEntryOffset = 2;
const lifetimeEntryOffset = 3;
const progressStartPause = 144;
const sectionIconSize = 22;
const totalIconSize = 30;

/**
 * Names shown beside each deck bonus.
 */
const bonusLabels: Record<XPBonusProps['kind'], string> = {
	completion: 'Deck completed',
	firstCompletion: 'First deck completion',
	perfect: 'Perfect deck (no missed words)',
};

/**
 * Show the saved XP and bonuses for this review attempt.
 * Looking at this view does not give the user more XP.
 */
export default function CompletionRewards({ session, color }: CompletionRewardsProps) {
	const { completion, results } = session;

	if (!completion) {
		return null;
	}

	/**
	 * Add up the XP shown beside each word.
	 */
	const wordXP = results.reduce((total, result) => total + result.xp, 0);

	/**
	 * Give each saved deck bonus a name and an XP amount to show.
	 */
	const bonuses: ReceiptBonusProps[] = completion.bonuses.map(bonus => ({
		id: bonus.kind,
		xp: bonus.xp,
		label: bonusLabels[bonus.kind],
	}));

	/**
	 * Add up the XP from deck bonuses
	 */
	const bonusXP = bonuses.reduce((total, bonus) => total + bonus.xp, 0);

	/**
	 * The full amount earned is word XP plus deck bonus XP.
	 */
	const earnedXP = wordXP + bonusXP;

	/**
	 * Count the words answered correctly. Wrong and skipped words do not count.
	 */
	const correctCount = results.filter(result => result.outcome === 'correct').length;

	/**
	 * Give each bonus row two turns in the animation order.
	 * First the row appears, then its XP starts counting.
	 */
	const bonusRows = bonuses.map((bonus, index) => {
		const rowIndex = animationOrder.firstBonusRow + index * animationsPerBonus;

		/**
		 * entry makes the row appear. xpIndex sets the turn for its XP count.
		 */
		return {
			...bonus,
			entry: getCompletionEntry(rowIndex),
			xpIndex: rowIndex + xpCountOffset,
		};
	});

	/**
	 * Show the bonus list only if there is at least one bonus row.
	 */
	const hasBonuses = bonusRows.length > 0;

	/**
	 * Choose the message to show when there are no deck bonuses.
	 * If no words were correct, explain what is needed to complete the deck.
	 */
	let noBonusLabel = 'No bonus XP for this review attempt.';

	if (correctCount === 0) {
		noBonusLabel =
			'Get at least one word correct to complete the deck and earn completion bonuses.';
	}

	/**
	 * Set the animations that make the Word XP and Bonus XP sections appear.
	 */
	const wordEntry = getCompletionEntry(animationOrder.word);
	const bonusEntry = getCompletionEntry(animationOrder.bonus);

	/**
	 * Put the total section after all bonus rows in the animation order.
	 * More bonus rows mean the total gets a later turn.
	 */
	const totalIndex = animationOrder.firstBonusRow + bonusRows.length * animationsPerBonus;

	/**
	 * Give the total XP count the next turn after the total section appears.
	 */
	const totalXPIndex = totalIndex + xpCountOffset;

	/**
	 * Show the XP bar next. The bar will wait before it starts filling.
	 */
	const progressIndex = totalIndex + progressEntryOffset;

	/**
	 * Show the user's saved XP total below the bar as the last item.
	 */
	const lifetimeIndex = totalIndex + lifetimeEntryOffset;

	/**
	 * Use these turn numbers to make the total section, bar, and saved XP text appear.
	 */
	const totalEntry = getCompletionEntry(totalIndex);
	const progressEntry = getCompletionEntry(progressIndex);
	const lifetimeEntry = getCompletionEntry(lifetimeIndex);

	/**
	 * Wait until everything appears and the XP count finishes before filling the bar.
	 */
	const lastEntryEnd = getCompletionDelay(lifetimeIndex) + completionEntryDuration;
	const lastCountEnd = getCompletionDelay(totalXPIndex) + completionEntryDuration + countUpDuration;
	const wordSummary = `${results.length} words studied · ${correctCount} correct`;
	const totalXPLabel = `${completion.totalXP.toLocaleString()} total XP`;
	const progressDelay = Math.max(lastEntryEnd, lastCountEnd) + progressStartPause;
	const xpStyle = { color };

	return (
		<View style={styles.container}>
			<Animated.View
				entering={wordEntry}
				style={styles.section}
			>
				<View style={styles.sectionHeading}>
					<MaterialSymbol
						name="cards_star"
						size={sectionIconSize}
						color={color}
					/>
					<Text style={[styles.title, styles.headingTitle]}>Word XP</Text>
					<CompletionXPAmount
						index={animationOrder.wordXP}
						value={wordXP}
						style={[styles.xp, xpStyle]}
					/>
				</View>
				<Text style={styles.description}>{wordSummary}</Text>
			</Animated.View>
			<Animated.View
				entering={bonusEntry}
				style={styles.section}
			>
				<View style={styles.sectionHeading}>
					<MaterialSymbol
						name="star"
						size={sectionIconSize}
						color={color}
					/>
					<Text style={[styles.title, styles.headingTitle]}>Bonus XP</Text>
					<CompletionXPAmount
						index={animationOrder.bonusXP}
						value={bonusXP}
						style={[styles.xp, xpStyle]}
					/>
				</View>
				{!hasBonuses && <Text style={styles.description}>{noBonusLabel}</Text>}
				{hasBonuses && (
					<View style={styles.bonuses}>
						{bonusRows.map(bonus => (
							<Animated.View
								entering={bonus.entry}
								key={bonus.id}
								style={styles.bonusRow}
							>
								<Text style={styles.bonusLabel}>{bonus.label}</Text>
								<CompletionXPAmount
									index={bonus.xpIndex}
									value={bonus.xp}
									style={styles.bonusXP}
								/>
							</Animated.View>
						))}
					</View>
				)}
			</Animated.View>
			<Animated.View
				entering={totalEntry}
				style={styles.total}
			>
				<View style={styles.totalHeading}>
					<MaterialSymbol
						name="auto_awesome"
						size={totalIconSize}
						color={color}
					/>
					<View style={styles.totalText}>
						<Text style={styles.title}>Total earned</Text>
						<CompletionXPAmount
							index={totalXPIndex}
							value={earnedXP}
							style={[styles.totalXP, xpStyle]}
						/>
					</View>
				</View>
				<Animated.View entering={progressEntry}>
					<CompletionXPProgress
						fromXP={session.xpBefore}
						toXP={completion.totalXP}
						delay={progressDelay}
						color={color}
					/>
				</Animated.View>
				<Animated.Text
					entering={lifetimeEntry}
					style={styles.totalXPLabel}
				>
					{totalXPLabel}
				</Animated.Text>
			</Animated.View>
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
	section: {
		gap: 4,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
	},
	sectionHeading: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		color: colors.dark.text,
	},
	headingTitle: {
		flex: 1,
	},
	xp: {
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	description: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	bonuses: {
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		backgroundColor: `${colors.light.secondary}55`,
		borderRadius: 6,
		padding: 8,
		gap: 4,
	},
	bonusRow: {
		flexDirection: 'row',
		alignItems: 'baseline',
		gap: 8,
	},
	bonusLabel: {
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 14,
		color: colors.dark.text,
	},
	bonusXP: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	total: {
		gap: 4,
		padding: 8,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		backgroundColor: `${colors.light.secondary}88`,
	},
	totalHeading: {
		flexDirection: 'row',
		gap: 8,
	},
	totalText: {
		display: 'flex',
		justifyContent: 'center',
		flex: 1,
	},
	totalXP: {
		fontFamily: 'lexend-700',
		fontSize: 28,
	},
	totalXPLabel: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
		textAlign: 'center',
	},
});
