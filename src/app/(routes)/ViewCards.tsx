import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import Loader from '@/src/components/Loader';
import ViewCardsView from '@/src/components/Views/ViewCardsView';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

/**
 * Read the paragraph ID from the route.
 */
function getRouteParam(routeParam: string | string[] | undefined): string | undefined {
	let result: string | undefined;

	if (Array.isArray(routeParam)) {
		result = routeParam[0];
	} else {
		result = routeParam;
	}

	return result;
}

/**
 * Find the selected paragraph by its saved ID and open its card.
 */
export default function ViewCards() {
	/**
	 * Saved progress and selected paragraph
	 */
	const { progressById, status } = useUserProgress();
	const routeParams = useLocalSearchParams();
	const paragraphId = getRouteParam(routeParams.paragraphId);
	let paragraph: Paragraph | undefined;

	if (paragraphId) {
		paragraph = findParagraphById(paragraphId);
	}

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return <Text>Could not load paragraph progress.</Text>;
	}

	if (
		paragraph &&
		!isItemUnlocked({
			id: paragraph.id,
			progressById,
		})
	) {
		return <Text style={styles.notice}>This paragraph is locked.</Text>;
	}

	return <ViewCardsView deck={paragraph} />;
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	notice: {
		textAlign: 'center',
	},
});
