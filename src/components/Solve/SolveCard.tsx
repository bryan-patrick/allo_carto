import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { cardBackgrounds } from '@/src/components/WordCard/cardBackgrounds';
import type { SolveWordStage } from '@/src/util/solveProgression';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SolvePosition } from './solveTypes';

interface SolveCardProps {
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
	card,
	stage,
	isSelected,
	disabled,
	storyColor,
	onSelect,
}: SolveCardProps) {
	const isSolved = card.acceptedAnswer !== null;
	const isDisabled = disabled || isSolved;
	const prompt = stage === 2 ? card.englishPrompt : card.text;
	const wordColor = {
		color: storyColor,
	};
	const selectedBorder = {
		borderColor: storyColor,
	};
	let accessibilityLabel = `${prompt}, card ${card.position + 1}, solve for ${card.inkCost} Ink`;

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
				{isSolved ?
					<Text style={styles.translation}>✓ {card.acceptedAnswer}</Text>
				:	<Text style={styles.cost}>{card.inkCost} Ink</Text>}
			</BackgroundImage>
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
