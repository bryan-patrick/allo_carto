import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { cardBackgrounds } from '@/src/components/WordCard/cardBackgrounds';
import type { SolveWordStage } from '@/src/util/solveProgression';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SolveRewardClaimButton from './SolveRewardClaimButton';
import type { SolvePosition, SolveReward } from './solveTypes';

interface SolveCardProps {
	deckId: string;
	reward?: SolveReward;
	onRewardClaimed: (reward: SolveReward) => void;
	card: SolvePosition;
	stage: SolveWordStage;
	isSelected: boolean;
	disabled: boolean;
	storyColor: string;
	onSelect: (position: number) => void;
}

/*
 * Returns a French/English word (card props) in Solve
 */
export default function SolveCard({
	deckId,
	reward,
	onRewardClaimed,
	card,
	stage,
	isSelected,
	disabled,
	storyColor,
	onSelect,
}: SolveCardProps) {
	const hasPendingReward = reward?.claimedAt === null;
	const isSolved = card.acceptedAnswer !== null && !hasPendingReward;
	const isDisabled = disabled || card.acceptedAnswer !== null;
	const prompt = stage === 2 ? card.englishPrompt : card.text;
	const wordColor = {
		color: storyColor,
	};
	const selectedBorder = {
		borderColor: storyColor,
	};
	let accessibilityLabel = `${prompt}, card ${card.position + 1}, solve for ${card.inkCost} Ink`;

	if (hasPendingReward) {
		accessibilityLabel = `${prompt}, solved, XP ready to claim`;
	} else if (isSolved) {
		accessibilityLabel = `${prompt}, solved: ${card.acceptedAnswer}`;
	}

	if (!card.wordId) {
		return (
			<View style={[styles.card, styles.exemptCard]}>
				<Text style={[styles.word, wordColor]}>{card.text}</Text>
			</View>
		);
	}

	return (
		<View
			style={[
				styles.wordCardContainer,
				styles.card,
				isSelected && selectedBorder,
				isSolved && styles.solvedBorder,
			]}
		>
			<Pressable
				accessibilityElementsHidden={hasPendingReward}
				importantForAccessibility={hasPendingReward ? 'no-hide-descendants' : 'auto'}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityState={{
					selected: isSelected,
					disabled: isDisabled,
				}}
				disabled={isDisabled}
				onPress={() => onSelect(card.position)}
				style={[styles.selectCard, hasPendingReward && styles.hiddenCard]}
			>
				<BackgroundImage
					source={cardBackgrounds[card.rarity]}
					style={[styles.cardContent, isSolved && styles.solvedBorder]}
				>
					{isSolved && (
						<View
							pointerEvents="none"
							style={styles.solvedOverlay}
						/>
					)}
					<Text style={[styles.word, wordColor]}>{prompt}</Text>
					{hasPendingReward ?
						<Text style={styles.cost}>Solved!</Text>
					: isSolved ?
						<Text style={styles.translation}>✓ {card.acceptedAnswer}</Text>
					:	<Text style={styles.cost}>{card.inkCost} Ink</Text>}
				</BackgroundImage>
			</Pressable>
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
}

const styles = StyleSheet.create({
	selectCard: {
		flex: 1,
	},
	hiddenCard: {
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
		margin: 3,
		padding: 4,
	},
	card: {
		width: '30%',
		flexGrow: 1,
		maxWidth: 120,
	},
	wordCardContainer: {
		borderColor: colors.light.goldenBorder,
		padding: 3,
		borderRadius: 8,
		borderWidth: 2,
		overflow: 'hidden',
	},
	cardContent: {
		flex: 1,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 4,
		overflow: 'hidden',
		alignContent: 'center',
		justifyContent: 'center',
		minHeight: 65,
		padding: 6,
		gap: 2,
	},
	exemptCard: {
		minHeight: 70,
		padding: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		borderWidth: 2,
	},
	solvedBorder: {
		backgroundColor: colors.light.success,
		borderColor: colors.dark.success,
	},
	solvedOverlay: {
		...StyleSheet.absoluteFill,
		backgroundColor: colors.light.success,
		opacity: 0.4,
	},
	word: {
		fontSize: 14,
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
	cost: {
		fontSize: 12,
		fontFamily: 'lexend-400',
		color: colors.wordProgress.familiar,
		textAlign: 'center',
	},
	translation: {
		fontSize: 14,
		fontFamily: 'lexend-400',
		color: colors.dark.success,
		textAlign: 'center',
	},
});
