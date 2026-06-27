import type { DeckPlace } from "@/data/french/deckAtlas";
import { deckAtlas } from "@/data/french/deckAtlas";
import DeckBox from "@/src/components/DeckBox";
import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import colors from "../colors";

/**
 * CardDeckSelect component
 */
export default function CardDeckSelect() {
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();

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
    for (const chapter of deckAtlas.chapters) {
      for (const place of chapter.places) {
        if (place.id === placeId) return place;
      }
    }
  }

  const place = findPlaceById(placeId);
  const decks = place?.decks || [];

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
  deckNameContainerStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  deckNameTextStyle: {
    textAlign: 'center',
    width: '100%',
    fontFamily: 'lexend-600',
    fontSize: 20,
    color: colors.light.text,
  },
  deckDescriptionTextStyle: {
    textAlign: 'center',
    width: '100%',
    fontFamily: 'lexend-400',
    fontSize: 16,
    paddingTop: 8,
    color: colors.light.text,
  },
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
