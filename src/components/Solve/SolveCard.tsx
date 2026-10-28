import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { cardBackgrounds } from '@/src/components/WordCard/cardBackgrounds';
import { getSolveCardInkCost, type SolveWordStage } from '@/src/util/solveProgression';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SolvePosition } from './solveTypes';

interface SolveCardProps {
	card: SolvePosition;
	stage: SolveWordStage;
	isSelected: boolean;
	disabled: boolean;
	storyColor: string;
	onSelect: (position: number) => void;
}

/**
 * Returns a French word (card props) in Solve or its English meaning in Solve+.
 */
export default function SolveCard({
	card,
	stage,
	isSelected,
	disabled,
	storyColor,
	onSelect,
}: SolveCardProps) {
	const isSolved = card.acceptedAnswer !== null;
	const isDisabled = disabled || isSolved;
	const cardCost = getSolveCardInkCost(stage, card.rarity);
	const prompt = stage === 2 ? card.englishPrompt : card.text;
	const wordColor = {
		color: storyColor,
	};
	const selectedBorder = {
		borderColor: storyColor,
	};
	let accessibilityLabel = `Locked ${card.rarity} card ${card.position + 1}, unlock for ${cardCost} Ink`;

	if (card.isUnlocked) {
		accessibilityLabel = `${prompt}, card ${card.position + 1}, solve for ${cardCost} Ink`;
	}

	if (isSolved) {
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
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{
				selected: isSelected,
				disabled: isDisabled,
			}}
			disabled={isDisabled}
			onPress={() => onSelect(card.position)}
			style={[
				styles.wordCardContainer,
				styles.card,
				isSelected && selectedBorder,
				isSolved && styles.solvedBorder,
			]}
		>
			<ImageBackground
				source={cardBackgrounds[card.rarity]}
				style={[styles.cardContent, isSolved && styles.solvedBorder]}
			>
				{card.isUnlocked ?
					<>
						<Text style={[styles.word, wordColor]}>{prompt}</Text>
						{isSolved && <Text style={styles.translation}>✓ {card.acceptedAnswer}</Text>}
					</>
				:	<>
						<MaterialSymbol
							name="lock"
							size={24}
							color={storyColor}
						/>
						<Text style={styles.cost}>Unlock ({cardCost} Ink)</Text>
					</>
				}
			</ImageBackground>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		width: '30%',
		flexGrow: 1,
		maxWidth: 120,
	},
	wordCardContainer: {
		borderColor: colors.light.border,
		padding: 2,
		borderRadius: 8,
		borderWidth: 3,
	},
	cardContent: {
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: colors.light.border,
		flex: 1,
		alignContent: 'center',
		padding: 6,
		marginVertical: 4,
		justifyContent: 'center',
		gap: 2,
		minHeight: 65,
	},
	exemptCard: {
		minHeight: 70,
		padding: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		borderWidth: 3,
	},
	solvedBorder: {
		backgroundColor: colors.light.success,
		borderColor: colors.dark.success,
	},
	word: {
		fontSize: 14,
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
	cost: {
		fontSize: 12,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
		textAlign: 'center',
	},
	translation: {
		fontSize: 14,
		fontFamily: 'lexend-400',
		color: colors.dark.success,
		textAlign: 'center',
	},
});
