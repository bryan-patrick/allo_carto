import sharedStyles from '@/src/app/sharedStyles';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';

interface ViewCardsViewProps {
	deck?: CardDeck;
}

/**
 * ViewCardsView component
 */
export default function ViewCardsView({ deck }: ViewCardsViewProps) {
	const title = deck?.title ?? 'Some Deck';
	const cardCount = deck?.wordIds.length ?? 0;
	const storyColor = getDeckStoryColor(deck?.id);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.card}>
				{deck && (
					<>
						<Text style={[styles.title, { color: storyColor }]}>{title}</Text>
						<Text style={styles.metaText}>{cardCount} cards</Text>
					</>
				)}
				{!deck && (
					<>
						<Text style={styles.title}>{title}</Text>
						<Text style={styles.metaText}>Deck not found.</Text>
					</>
				)}
			</View>
		</ScrollView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		padding: sharedStyles.containerMargin,
	},
	card: {
		backgroundColor: colors.light.background,
		borderColor: colors.light.border,
		borderRadius: 8,
		borderWidth: 4,
		boxShadow: `0 12px 0 ${colors.dark.border}`,
		gap: 8,
		padding: 16,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-700',
		fontSize: 22,
	},
	metaText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
});
