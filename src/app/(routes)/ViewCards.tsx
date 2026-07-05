import { deckAtlas } from "@/data/french/deckAtlas";
import type { CardDeck } from "@/src/components/CardDeck/cardDeckTypes";
import ViewCardsView from "@/src/components/Views/ViewCardsView";
import { useLocalSearchParams } from "expo-router";

interface ViewCardsRouteParams {
  deckTitle?: string;
  placeId?: string;
}

function getRouteParam(routeParam: string | string[] | undefined) {
  let result: string | undefined;

  if (Array.isArray(routeParam)) {
    result = routeParam[0];
  } else {
    result = routeParam;
  }

  return result;
}

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
  const routeParams = useLocalSearchParams();
  const deckTitle = getRouteParam(routeParams.deckTitle);
  const placeId = getRouteParam(routeParams.placeId);
  const deck = findDeckByRouteParams({
    deckTitle,
    placeId,
  });

  return <ViewCardsView deck={deck} deckTitle={deckTitle} />
}
