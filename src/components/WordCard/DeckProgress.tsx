import colors from '@/src/app/colors';
import sharedStyles from '@/src/app/sharedStyles';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { type CardRarity, Word } from '../CardDeck/cardDeckTypes';
import { useCardDeck } from '../CardDeck/useCardDeck';

/**
 * Controls the glow radius for the blips
 */
const glowRadiusByRarity: Record<CardRarity, number> = {
	Common: 0,
	Rare: 4,
	Epic: 8,
	Legendary: 16,
};

/**
 * DeckProgress component
 */
export default function DeckProgress() {
	/**
	 * State
	 */
	const { cardDeckState } = useCardDeck();

	/**
	 * Destructuring
	 */
	const { cardDeck: currentCardDeck, currentIndex, correctWords, incorrectWords } = cardDeckState;
	const { words } = currentCardDeck;
	const { deckProgressContainerStyle, progressTextStyle, blipContainerStyle, blipStyle } = styles;

	/**
	 * Card vars
	 */
	const totalCards = words.length;
	const currentCard = currentIndex + 1;
	const correctWordIds: Set<string> = new Set(correctWords.map(word => word.id));
	const incorrectWordIds: Set<string> = new Set(incorrectWords.map(word => word.id));

	/**
	 * Render the component
	 */
	return (
		<View style={deckProgressContainerStyle}>
			<Text style={progressTextStyle}>
				Card {currentCard}/{totalCards}
			</Text>
			<View style={blipContainerStyle}>
				{
					/**
					 * Map and render the blip things
					 */
					words.map((word: Word, index: number) => {
						const rarity: CardRarity = word.rarity ?? 'Common';
						const rarityColor: string = colors.rarity[rarity];
						const isCorrect: boolean = correctWordIds.has(word.id);
						const isIncorrect: boolean = incorrectWordIds.has(word.id);
						const isCompleted: boolean = index + 1 < currentCard;
						const isCurrent: boolean = index + 1 === currentCard;
						const isFilled: boolean = isCompleted || isCorrect || isIncorrect;
						const blipColor: string = isIncorrect ? colors.light.danger : rarityColor;
						const glowRadius: number = glowRadiusByRarity[rarity];

						/**
						 * Dynamic Blip styles
						 */
						const dynamicBlipStyle: ViewStyle = {
							borderColor: blipColor,
							backgroundColor: isFilled ? blipColor : 'transparent',
							opacity: isFilled || isCurrent ? 1 : 0.5,
							shadowColor: blipColor,
							shadowOffset: { width: 0, height: 0 },
							shadowOpacity: isFilled && glowRadius ? 1 : 0,
							shadowRadius: glowRadius,
						};

						/**
						 * Render a blip
						 */
						return (
							<View
								key={`progress-blip-${word.id}`}
								testID={`progress-blip-${word.id}`}
								style={[blipStyle, dynamicBlipStyle]}
							/>
						);
					})
				}
			</View>
		</View>
	);
}

/**
 * Shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
	deckProgressContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		maxWidth: '100%',
		paddingHorizontal: containerMargin,
		paddingVertical: 2,
		backgroundColor: colors.dark.text,
		gap: 12,
	},
	progressTextStyle: {
		fontFamily: 'azeret-mono-600',
		fontSize: 12,
		color: colors.light.background,
	},
	blipContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		flexShrink: 1,
		gap: 4,
	},
	blipStyle: {
		height: 10,
		width: 8,
		flexShrink: 1,
		borderWidth: 1,
		borderRadius: 2,
		borderColor: colors.light.background,
	},
});
