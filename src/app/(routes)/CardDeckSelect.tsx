import type { CardDeck } from "@/src/components/CardDeck/cardDeckTypes";
import DeckBox from "@/src/components/DeckBox";
import Loader from "@/src/components/Loader";
import { useUserProgress } from "@/src/db/useUserProgress";
import { findPlaceById, isProgressAccessible } from "@/src/util/atlasProgression";
import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import colors from "../colors";

/**
 * CardDeckSelect component
 */
export default function CardDeckSelect() {
  const { placeId } = useLocalSearchParams<{ placeId?: string; }>();
  const { progressById, status } = useUserProgress();

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

  const place = findPlaceById(placeId);
  const decks = place?.decks || [];

  /**
   * Check a deck's lock
   */
  function getIsDeckLocked(deck: CardDeck): boolean {
    return !isProgressAccessible({ id: deck.id, progressById });
  }

  /**
   * Wait for the user's stored percentages
   */
  if (status === 'loading') return <Loader />;
  if (status === 'error') return <Text>Could not load deck progress.</Text>;

  /**
   * Block locked places
   */
  if (place && !isProgressAccessible({ id: place.id, progressById })) {
    return (
      <View style={noDecksContainerStyle}>
        <Text style={noDecksTextStyle}>This place is locked.</Text>
      </View>
    );
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
          /**
           * BG color is for scroll bounce
           */
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
