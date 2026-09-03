import { storyAtlas } from '@/data/french/storyAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import Loader from '@/src/components/Loader';
import ViewCardsView from '@/src/components/Views/ViewCardsView';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

/**
 * Typing
 */
interface ViewCardsRouteParams {
	deckTitle?: string;
	chapterId?: string;
}

/**
 * Get one route param
 */
function getRouteParam(routeParam: string | string[] | undefined) {
	let result: string | undefined;

	if (Array.isArray(routeParam)) {
		result = routeParam[0];
	} else {
		result = routeParam;
	}

	return result;
}

/**
 * Find the deck from the route
 */
function findDeckByRouteParams({
	deckTitle,
	chapterId,
}: ViewCardsRouteParams): CardDeck | undefined {
	let routeDeck: CardDeck | undefined;

	for (const story of storyAtlas.stories) {
		for (const chapter of story.chapters) {
			if (chapter.id === chapterId) {
				routeDeck = chapter.decks.find(deck => deck.title === deckTitle);
			}
		}
	}

	return routeDeck;
}

/**
 * Route wrapper for viewing all cards in a deck.
 */
export default function ViewCards() {
	const { progressById, status } = useUserProgress();
	const routeParams = useLocalSearchParams();
	const deckTitle = getRouteParam(routeParams.deckTitle);
	const chapterId = getRouteParam(routeParams.chapterId);
	const deck = findDeckByRouteParams({
		deckTitle,
		chapterId,
	});

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load deck progress.</Text>;

	/**
	 * Block locked decks
	 */
	if (deck && !isItemUnlocked({ id: deck.id, progressById })) {
		return <Text>This deck is locked.</Text>;
	}

	/**
	 * Render the cards
	 */
	return <ViewCardsView deck={deck} />;
}
