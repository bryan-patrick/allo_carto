import { deckAtlas, DeckChapter, DeckPlace } from "@/data/french/deckAtlas";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../app/colors";
import LinkButton from "./LinkButton";

/**
 * Place Select View component
 */
export default function PlaceSelectView() {
  const {
    chapterContainerStyle,
    chapterTitleContainerStyle,
    chapterIndexStyle,
    chapterTitleStyle,
    placeContainerStyle,
    placeImageStyle,
    placeNameContainerStyle,
    placeNameTextStyle,
    placeDescriptionTextStyle,
    linkButtonStyle
  } = styles;

  const { chapters } = deckAtlas;

  /**
   * Render the card grid
   */
  return (
    <ScrollView>
      {
        /**
         * Map the chapters
         */
        chapters.map((chapter: DeckChapter, index) => {

          /**
           * Destructure the chapters
           */
          const { id, name, places } = chapter;

          /**
           * Render the individual chapter sections
           */
          return (
            <View style={chapterContainerStyle} key={id}>
              <View style={chapterTitleContainerStyle}>
                <Text style={chapterIndexStyle}>Chapter {index + 1}:</Text>
                <Text style={chapterTitleStyle}>{name}</Text>
              </View>
              {
                /**
                 * Map the places
                 */
                places.map((place: DeckPlace) => {

                  /**
                   * Destructure the place data
                   */
                  const { id: placeId, name, description, image } = place;

                  /**
                   * Render the place view/card
                   */
                  return (
                    <View
                      key={placeId}
                      style={placeContainerStyle}
                    >
                      <View style={placeNameContainerStyle}>
                        <Text style={placeNameTextStyle}>{name}</Text>
                        <Text style={placeDescriptionTextStyle}>{description}</Text>
                      </View>
                      <Image
                        source={image}
                        style={placeImageStyle}
                      />
                      <LinkButton
                        style={linkButtonStyle}
                        screen={'(routes)/CardDeckSelect'}
                        params={{ placeId }}
                      >
                        <Text>View decks →</Text>
                      </LinkButton>
                    </View>
                  )
                })
              }
            </View>
          )
        })
      }
    </ScrollView>
  );
}

/**
 * Styles
 * TODO: styles
 */
const styles = StyleSheet.create({
  chapterContainerStyle: {
    display: 'flex',
    gap: 24,
    padding: 16,
  },
  chapterTitleContainerStyle: {
    gap: 4,
  },
  chapterIndexStyle: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.light.text
  },
  chapterTitleStyle: {
    textAlign: 'center',
    width: '100%',
    fontWeight: 800,
    fontSize: 22,
    color: colors.light.text,
  },
  placeContainerStyle: {
    display: 'flex',
    borderWidth: 4,
    borderRadius: 24,
    padding: 4,
    borderColor: colors.dark.border,
    backgroundColor: colors.light.background
  },
  placeImageStyle: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    padding: 16,
  },
  placeNameContainerStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeNameTextStyle: {
    color: colors.dark.text,
    fontWeight: 700,
    fontSize: 18,
    marginTop: 16
  },
  placeDescriptionTextStyle: {
    paddingRight: 16,
    paddingLeft: 16,
    paddingTop: 8,
    fontWeight: 400,
    fontSize: 16
  },
  linkButtonStyle: {
    margin: 16,
    marginTop: 2,
    marginBottom: 24
  }
})
