import colors from '@/src/app/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useCardDeck } from '../CardDeck/useCardDeck';
import WordProgress from '../WordProgress';

/**
 * WordCardHeader Component
 */
export default function WordCardHeader() {
	const { currentCard } = useCardDeck();

	/**
	 * Card vars
	 */
	const { rarity } = currentCard;

	/**
	 * Render the WordCardHeader
	 */
	return (
		<View style={styles.cardHeaderContainer}>
			<View
				style={[
					styles.CEFRContainer,
					{ backgroundColor: `${colors.light.CEFR[currentCard.CEFR]}26` },
				]}
			>
				<Text style={[styles.cardCEFRLevel, { color: colors.dark.CEFR[currentCard.CEFR] }]}>
					{currentCard.CEFR}
				</Text>
			</View>
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				colors={[`${colors.rarity[rarity]}88`, '#ffffff00']}
				style={styles.rarityContainer}
			>
				<Text style={styles.rarityText}>{rarity}</Text>
			</LinearGradient>
			<WordProgress />
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	cardHeaderContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		flexDirection: 'row',
		width: '100%',
		overflow: 'hidden',
		borderBottomWidth: 1,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderColor: colors.light.border,
	},
	CEFRContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		borderTopLeftRadius: 4,
		borderRightWidth: 1,
	},
	cardCEFRLevel: {
		width: '100%',
		paddingHorizontal: 8,
		fontFamily: 'azeret-mono-600',
		fontSize: 14,
		borderColor: colors.light.border,
	},
	rarityContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: '100%',
		paddingLeft: 8,
		flexGrow: 1,
	},
	rarityText: {
		fontFamily: 'azeret-mono-400',
	},
});
