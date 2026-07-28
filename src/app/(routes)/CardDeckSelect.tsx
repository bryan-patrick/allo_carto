import type { DeckPlace } from "@/data/french/deckAtlas";
import { deckAtlas, getDecks } from "@/data/french/deckAtlas";
import type { CardDeck } from "@/src/components/CardDeck/cardDeckTypes";
import DeckBox from "@/src/components/DeckBox";
import { getDeckHighestSoftCompletedRank } from "@/src/db/interface";
import { useUserContext } from "@/src/db/useUserContext";
import { doesCompletedRankMeetRequirement } from "@/src/util/deckRankProgression";
import type { WordRankKey } from "@/src/util/wordRanks";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import colors from "../colors";

type CompletedRankByDeckId = Record<string, WordRankKey | null>;

const orderedDecks = getDecks();

/**
 * CardDeckSelect component
 */
export default function CardDeckSelect() {
  const { placeId } = useLocalSearchParams<{ placeId?: string; }>();
  const userId = useUserContext()?.id;
  const [ completedRankByDeckId, setCompletedRankByDeckId ] = useState<CompletedRankByDeckId | null>(null);

  /**
   * Destructure styles
  */
  const {
    cardGridStyle,
    noDecksContainerStyle,
    noDecksTextStyle,
    deckNameContainerStyle,
    deckNameTextStyle,
    deckDescriptionTextStyle
  } = styles;

  function findPlaceById(placeId: string | undefined): DeckPlace | undefined {
    let result: DeckPlace | undefined;

    for (const chapter of deckAtlas.chapters) {
      for (const place of chapter.places) {
        if (!result && place.id === placeId) {
          result = place;
        }
      }
    }

    return result;
  }

  const place = findPlaceById(placeId);
  const decks = place?.decks || [];

  /**
   * Check deck progress whenever this screen opens again.
   * This lets the next deck unlock right away.
   * I like useCallabck here so it doesn't update every state change.
   */
  useFocusEffect(
    useCallback(() => {
      /**
       * The database may finish after this screen loses focus.
       * This flag stops that old request from changing the view.
       * I debated whether or not we need to do this, but it is possible
       * to have a race condition since this updates on focus, so sure.
       * 
       * Makes sense when a user is very quickly changing views.
       */
      let shouldUpdateState = true;

      async function getCompletedRanks() {
        /**
         * Start with no finished deck ranks.
         */
        let result: CompletedRankByDeckId = {};

        try {
          if (userId) {
            /**
             * Ask the database for every deck's finished rank.
             */
            const allFinishedRanks = await Promise.all(
              orderedDecks.map(async (deck) => {
                const completedRank = await getDeckHighestSoftCompletedRank({
                  userId,
                  wordIds: deck.wordIds,
                });

                /**
                 * Keep each rank beside its deck ID.
                 */
                const entry: [ string, WordRankKey | null ] = [
                  deck.id,
                  completedRank,
                ];

                return entry;
              })
            );

            /**
             * Make a lookup so each deck can find its rank quickly.
             */
            result = Object.fromEntries(allFinishedRanks);
          }
        } catch (error) {
          /**
           * Keep decks safely locked if loading fails.
           */
          console.error('Could not retrieve deck progression:', error);
        }

        /**
         * Show the loaded ranks only while this screen has focus.
         * If it unmounted it'd be set false
         */
        if (shouldUpdateState) {
          setCompletedRankByDeckId(result);
        }
      }

      /**
       * Clear old ranks while the fresh ranks load.
       */
      setCompletedRankByDeckId(null);

      /**
       * Init the useEffect
       */
      getCompletedRanks();

      /**
       * Block the pending request when this screen loses focus.
       */
      return () => {
        shouldUpdateState = false;
      };
    }, [ userId ])
  );

  /**
   * A deck compares its requirement with the completed rank of the previous
   * deck in the global atlas order. The first deck has no prerequisite.
   */
  function getIsDeckLocked(deck: CardDeck): boolean {
    let result = true;
    const deckIndex = orderedDecks.findIndex(({ id }) => id === deck.id);

    if (deckIndex === 0 || deck.requiredPreviousDeckRank === null) {
      result = false;
    }

    if (
      deckIndex > 0 &&
      deck.requiredPreviousDeckRank !== null &&
      completedRankByDeckId
    ) {
      const previousDeck = orderedDecks[ deckIndex - 1 ];
      const completedRank = completedRankByDeckId[ previousDeck.id ] ?? null;

      result = !doesCompletedRankMeetRequirement({
        completedRank,
        requiredRank: deck.requiredPreviousDeckRank,
      });
    }

    return result;
  }

  /**
   * Render the card grid
   */
  return (
    <>
      <View style={deckNameContainerStyle}>
        <Text style={deckNameTextStyle}>{place?.name}</Text>
        <Text style={deckDescriptionTextStyle}>{place?.description}</Text>
      </View>
      {decks.length > 0 && (
        <FlatList
          // BG color is for scroll bounce
          style={{ backgroundColor: colors.dark.text }}
          contentContainerStyle={cardGridStyle}
          renderItem={({ item }) => <DeckBox deck={item} placeId={placeId} isLocked={getIsDeckLocked(item)} />}
          keyExtractor={(deck) => deck.id}
          overScrollMode="always"
          data={decks}
        />
      )}
      {decks.length === 0 && (
        <View style={noDecksContainerStyle}>
          <Text style={noDecksTextStyle}>Sorry! No decks found.</Text>
        </View>
      )}
    </>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  deckNameContainerStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.dark.text
  },
  deckNameTextStyle: {
    textAlign: 'center',
    width: '100%',
    fontFamily: 'lexend-600',
    fontSize: 18,
    color: colors.light.text,
  },
  deckDescriptionTextStyle: {
    textAlign: 'center',
    width: '100%',
    fontFamily: 'lexend-400',
    fontSize: 14,
    paddingTop: 4,
    color: colors.light.text,
  },
  cardGridStyle: {
    display: 'flex',
    backgroundColor: colors.dark.text,
    gap: 8,
    margin: 8
  },
  noDecksContainerStyle: {
    display: 'flex',
    padding: 12
  },
  noDecksTextStyle: {
    textAlign: 'center',
    color: colors.light.text
  }
});
