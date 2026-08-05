import { deckAtlas } from "@/data/french/deckAtlas";
import type { CardDeck } from "@/src/components/CardDeck/cardDeckTypes";
import ViewCardsView from "@/src/components/Views/ViewCardsView";
import Loader from "@/src/components/Loader";
import { useUserProgress } from "@/src/db/useUserProgress";
import { isProgressAccessible } from "@/src/util/atlasProgression";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

/**
 * Typing
 */
interface ViewCardsRouteParams {
  deckTitle?: string;
  placeId?: string;
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
  placeId,
}: ViewCardsRouteParams): CardDeck | undefined {
  let routeDeck: CardDeck | undefined;

  for (const chapter of deckAtlas.chapters) {
    for (const place of chapter.places) {
      if (place.id === placeId) {
        routeDeck = place.decks.find((deck) => deck.title === deckTitle);
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
  const placeId = getRouteParam(routeParams.placeId);
  const deck = findDeckByRouteParams({
    deckTitle,
    placeId,
  });

  /**
   * Wait for the user's stored percentages
   */
  if (status === 'loading') return <Loader />;
  if (status === 'error') return <Text>Could not load deck progress.</Text>;

  /**
   * Block locked decks
   */
  if (deck && !isProgressAccessible({ id: deck.id, progressById })) {
    return <Text>This deck is locked.</Text>;
  }

  /**
   * Render the cards
   */
  return <ViewCardsView deck={deck} />
}
