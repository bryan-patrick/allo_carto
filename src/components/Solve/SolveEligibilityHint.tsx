import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { StyleSheet, Text } from 'react-native';
import { useSolveProgress } from './useSolveProgress';

interface SolveEligibilityHintProps {
	deck: CardDeck;
}

/**
 * We show this beside a locked Solve button to explain how the player can open its puzzle.
 */
export default function SolveEligibilityHint({ deck }: SolveEligibilityHintProps) {
	const { unlockMessage } = useSolveProgress(deck.id);

	if (!unlockMessage) {
		return null;
	}

	return <Text style={styles.hint}>{unlockMessage}</Text>;
}

const styles = StyleSheet.create({
	hint: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		color: colors.dark.text,
	},
});
