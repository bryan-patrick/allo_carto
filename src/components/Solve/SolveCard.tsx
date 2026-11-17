import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { cardBackgrounds } from '@/src/components/WordCard/cardBackgrounds';
import type { SolveWordStage } from '@/src/util/solveProgression';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
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

/**
 * Shows a word puzzle card with its prompt, solved answer, and claimable XP.
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
	/**
	 * Card progress and availability
	 */
	const hasPendingReward = reward?.claimedAt === null;
	const isSolved = card.acceptedAnswer !== null && !hasPendingReward;
	const isDisabled = disabled || card.acceptedAnswer !== null;

	/**
	 * Card colors and selection shadow
	 */
	const wordColor = {
		color: storyColor,
	};
	const selectedCardStyle = {
		borderColor: storyColor,
		boxShadow: `0 3px 6px ${storyColor}`,
	};

	/**
	 * Initial prompt, solved answer, and card status
	 */
	let prompt = card.text;
	let solvedAnswerText = card.acceptedAnswer ?? '';
	let statusText = `${card.inkCost} Ink`;
	let statusTextStyle = styles.cost;

	/**
	 * Screen reader descriptions
	 */
	let accessibilityLabel = '';
	let importantForAccessibility: ViewProps['importantForAccessibility'] = 'auto';

	/**
	 * Show each solved French word as it appears in the passage, such as J’ before habite.
	 */
	if (stage === 2) {
		prompt = card.englishPrompt;
		solvedAnswerText = card.text;
	}

	accessibilityLabel = `${prompt}, card ${card.position + 1}, solve for ${card.inkCost} Ink`;

	if (hasPendingReward) {
		statusText = 'Solved!';
		importantForAccessibility = 'no-hide-descendants';
		accessibilityLabel = `${prompt}, solved, XP ready to claim`;
	} else if (isSolved) {
		statusText = `✓ ${solvedAnswerText}`;
		statusTextStyle = styles.translation;
		accessibilityLabel = `${prompt}, solved: ${solvedAnswerText}`;
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
				isSelected && selectedCardStyle,
				isSolved && styles.solvedBorder,
			]}
		>
			<Pressable
				accessibilityElementsHidden={hasPendingReward}
				importantForAccessibility={importantForAccessibility}
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
					<Text style={statusTextStyle}>{statusText}</Text>
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
		margin: 2,
		padding: 2,
	},
	card: {
		width: '30%',
		flexGrow: 1,
		maxWidth: 120,
	},
	wordCardContainer: {
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		borderWidth: 2,
		padding: 2,
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
		borderColor: colors.light.border,
		borderWidth: 1,
		borderRadius: 8,
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
