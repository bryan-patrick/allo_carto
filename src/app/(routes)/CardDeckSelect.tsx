import type { DeckPlace } from "@/data/french/deckAtlas";
import { deckAtlas } from "@/data/french/deckAtlas";
import DeckBox from "@/src/components/DeckBox";
import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import colors from "../colors";

/**
 * ChooseCardDeck component
*/
export default function CardDeckSelect() {
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();

  /**
   * Destructure styles
  */
  const {
    cardGridStyle,
    noDecksContainerStyle,
    noDecksTextStyle
  } = styles;

  function findPlaceById(placeId: string | undefined): DeckPlace | undefined {
    for (const chapter of deckAtlas.chapters) {
      for (const place of chapter.places) {
        if (place.id === placeId) return place;
      }
    }
  }

  const decks = findPlaceById(placeId)?.decks || [];

  /**
   * Render the card grid
   */
  return (
    <>
      {decks.length > 0 && (
        <FlatList
          contentContainerStyle={cardGridStyle}
          data={decks}
          renderItem={({ item }) => <DeckBox deck={item} />}
          keyExtractor={(deck, index) => `${deck.title}-${index}`}
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
  cardGridStyle: {
    display: 'flex',
  },
  noDecksContainerStyle: {
    display: 'flex',
    padding: 12
  },
  noDecksTextStyle: {
    textAlign: 'center',
    color: colors.light.text
  }
})
