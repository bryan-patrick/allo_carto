import { deckAtlas, DeckChapter, DeckPlace } from "@/data/french/deckAtlas";
import sharedStyles from "@/src/app/sharedStyles";
import { useUserContext } from "@/src/db/useUserContext";
import { getDecksProgress } from "@/src/util/getDecksProgress";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import LinkButton from "../LinkButton";

interface PlaceProgressById {
  [ placeId: string ]: number;
}

/**
 * PlaceSelectView component
 */
export default function PlaceSelectView() {
  const user = useUserContext();
  const [ placeProgressById, setPlaceProgressById ] = useState<PlaceProgressById>({});
  const {
    chapterContainerStyle,
    polaroid,
    polaroidInnerStyle,
    chapterTitleContainerStyle,
    chapterIndexStyle,
    chapterTitleStyle,
    placeContainerStyle,
    progressContainerStyle,
    progressBarsContainer,
    progressBarStyle,
    progressTextStyle,
    polaroidContainerStyle,
    placeImageStyle,
    placeNameContainerStyle,
    placeTitleContainerStyle,
    placeTitleTextStyle,
    placeDescriptionTextStyle,
    placeSelectButtonStyle,
    placeSelectButtonTextStyle
  } = styles;

  const { chapterId } = useLocalSearchParams<{ chapterId?: string; }>();
  const { chapters } = deckAtlas;
  const selectedChapter: DeckChapter = chapters.find((chapter) => chapter.id === chapterId)!;

  const { name, places, chapterName } = selectedChapter;

  useFocusEffect(
    useCallback(() => {
      let shouldUpdateState = true;

      async function getPlaceProgress() {
        const result: PlaceProgressById = {};

        try {
          if (user?.id) {
            for (const place of places) {
              result[ place.id ] = await getDecksProgress({
                decks: place.decks,
                userId: user.id,
              });
            }
          }
        } catch (error) {
          console.error('Could not retrieve place progress:', error);
        }

        if (shouldUpdateState) setPlaceProgressById(result);
      }

      setPlaceProgressById({});
      getPlaceProgress();

      return () => {
        shouldUpdateState = false;
      };
    }, [ places, user?.id ])
  );

  /**
   * Render the card grid
   */
  return (
    <ScrollView>
      <View style={chapterContainerStyle}>
        <View style={chapterTitleContainerStyle}>
          <Text style={chapterIndexStyle}>{chapterName}</Text>
          <Text style={chapterTitleStyle}>{name}</Text>
        </View>
        {
          /**
           * Map the places
           */
          places.map((place: DeckPlace, index: number) => {
            const isEven = index % 2 === 0;
            const rotate = isEven ? '-5deg' : '5deg';
            const reverseRotate = isEven ? '5deg' : '-5deg';

            /**
             * Destructure the place data
             */
            const { id: placeId, name, description, image } = place;
            const progressPercent = placeProgressById[ placeId ] ?? 0;

            /**
             * Render the place view/card
             */
            return (
              <View key={placeId} style={placeContainerStyle}>
                <View style={placeTitleContainerStyle}>
                  <Text style={placeTitleTextStyle}>{name}</Text>
                </View>
                <View
                  style={[ polaroidContainerStyle, { transform: [ { rotate: reverseRotate } ] } ]}
                >
                  <View style={[ polaroid, { transform: [ { rotate } ] } ]}>
                    <View style={polaroidInnerStyle}>
                      <Image
                        source={image}
                        style={placeImageStyle}
                      />
                      <View>
                        <View style={placeNameContainerStyle}>
                          <Text style={placeDescriptionTextStyle}>{description}</Text>
                        </View>
                      </View>
                      <View style={progressContainerStyle}>
                        <Text style={progressTextStyle}>Progress {progressPercent}%</Text>
                        <View style={progressBarsContainer}>
                          <LinearGradient
                            style={[ progressBarStyle, { width: `${progressPercent}%`, borderRightWidth: 1 } ]}
                            colors={[
                              '#E6320D', '#E6320D',
                              '#F17E06', '#F17E06',
                              '#F8BA26', '#F8BA26',
                              '#78BA34', '#78BA34',
                              '#3791CF', '#3791CF'
                            ]}
                            locations={[ 0, 0.2, 0.2, 0.4, 0.4, 0.6, 0.6, 0.8, 0.8, 1 ]}
                          />
                          <LinearGradient
                            style={[ progressBarStyle, { position: 'absolute', width: '100%', opacity: 0.15 } ]}
                            colors={[
                              '#E6320D', '#E6320D',
                              '#F17E06', '#F17E06',
                              '#F8BA26', '#F8BA26',
                              '#78BA34', '#78BA34',
                              '#3791CF', '#3791CF'
                            ]}
                            locations={[ 0, 0.2, 0.2, 0.4, 0.4, 0.6, 0.6, 0.8, 0.8, 1 ]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <LinkButton
                  hitSlop={10}
                  arrowSize={16}
                  style={placeSelectButtonStyle}
                  screen={'(routes)/CardDeckSelect'}
                  params={{ placeId }}
                >
                  <Text style={placeSelectButtonTextStyle}>View decks</Text>
                </LinkButton>
              </View>
            );
          })
        }
      </View>
    </ScrollView>
  );
}

/**
 * Shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 * TODO: styles
 */
const styles = StyleSheet.create({
  chapterContainerStyle: {
    display: 'flex',
    backgroundColor: colors.dark.text,
    gap: 8,
    paddingBottom: 16
  },
  chapterTitleContainerStyle: {
    marginHorizontal: containerMargin,
    marginVertical: 16
  },
  placeContainerStyle: {
    padding: containerMargin,
    gap: 24,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.dark.background,
  },
  polaroidContainerStyle: {
    display: 'flex',
    backgroundColor: colors.light.polaroid,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
    // shadowColor: colors.dark.text,
    // shadowOffset: { width: 8, height: 8 },
    // marginRight: 8, // Match the shadow offset width
    // marginBottom: 8, // Match the shadow offset height
    // shadowOpacity: 1,
    // shadowRadius: 4,
  },
  polaroid: {
    backgroundColor: colors.light.text,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  polaroidInnerStyle: {
    padding: 12,
  },
  chapterIndexStyle: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.light.text,
  },
  chapterTitleStyle: {
    textAlign: 'center',
    width: '100%',
    fontFamily: 'lexend-600',
    fontSize: 20,
    color: colors.light.text,
  },
  placeTitleContainerStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeTitleTextStyle: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    fontSize: 18
  },
  progressContainerStyle: {
    paddingHorizontal: 8,
    paddingTop: 4
  },
  placeImageStyle: {
    width: '100%',
    height: 200,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.dark.border
  },
  placeNameContainerStyle: {
    alignItems: 'center',
  },
  placeDescriptionTextStyle: {
    padding: 8,
    fontFamily: 'shadows-400',
    fontSize: 16,
  },
  progressBarStyle: {
    width: '10%',
    height: 8,
    borderColor: colors.light.border
  },
  progressBarsContainer: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: colors.light.border,
  },
  progressTextStyle: {
    fontFamily: 'shadows-400',
    fontSize: 12,
  },
  placeSelectButtonStyle: {
    alignSelf: 'center',
    paddingHorizontal: 48,
    paddingVertical: 14,
    marginBottom: 4,
  },
  placeSelectButtonTextStyle: {
    fontSize: 14,
  }
});
