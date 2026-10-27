import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { useUserProgress } from '@/src/db/useUserProgress';
import { StyleSheet, Text } from 'react-native';

interface SolveEligibilityHintProps {
	deck: CardDeck;
}

/**
 * This is there to let the user know what they need to do to
 * be able to used the disabled solve button (they need to see all cards)
 */
export default function SolveEligibilityHint({ deck }: SolveEligibilityHintProps) {
	const { progressById } = useUserProgress();
	const seenWordCount = progressById[deck.id]?.seenWordCount ?? 0;
	const wordCount = deck.wordIds.length;

	if (wordCount === 0 || seenWordCount >= wordCount) {
		return null;
	}

	return (
		<Text style={styles.hint}>
			Solve unlocks when you have seen every flashcard ({seenWordCount} of {wordCount} seen).
		</Text>
	);
}

const styles = StyleSheet.create({
	hint: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		color: colors.dark.text,
	},
});
