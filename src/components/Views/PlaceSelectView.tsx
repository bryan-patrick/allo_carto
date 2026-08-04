import { DeckAtlas, deckAtlas, DeckChapter, DeckPlace } from "@/data/french/deckAtlas";
import sharedStyles from "@/src/app/sharedStyles";
import { useUserContext } from "@/src/db/useUserContext";
import { getDecksProgress } from "@/src/util/getDecksProgress";
import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import LinkButton from "../LinkButton";

/**
 * Typing
 */
interface PlaceProgressById {
  [ placeId: string ]: number;
}

/**
 * For the progress bars on the polaroids
 */
const polaroidColors: LinearGradientProps[ 'colors' ] = [
  '#E6320D', '#E6320D',
  '#F17E06', '#F17E06',
  '#F8BA26', '#F8BA26',
  '#78BA34', '#78BA34',
  '#3791CF', '#3791CF'
];

const polaroidColorStops: NonNullable<LinearGradientProps[ 'locations' ]> = [
  0, 0.2,
  0.2, 0.4,
  0.4, 0.6,
  0.6, 0.8,
  0.8, 1
];

/**
 * PlaceSelectView component
 */
export default function PlaceSelectView() {
  const userId: string | undefined = useUserContext()?.id;
  const [ placeProgressById, setPlaceProgressById ] = useState<PlaceProgressById>({});

  /**
   * DestructureStyles
   */
  const {
    viewStyle,
    chapterTitleContainerStyle,
    chapterIndexStyle,
    chapterTitleStyle,
    chapterContainerStyle,
    placeContainerStyle,
    placeTitleTextStyle,
    polaroidContainerStyle,
    polaroid,
    placeImageStyle,
    placeDescriptionTextStyle,
    progressContainerStyle,
    progressTextStyle,
    progressBarsContainer,
    progressBarStyle,
    placeSelectButtonStyle,
    placeSelectButtonTextStyle
  } = styles;

  const initialChapter: Partial<DeckChapter> = {
    name: '',
    places: [],
    chapterName: ''
  };

  const { id } = useLocalSearchParams<{ id?: string; }>();
  const { chapters }: Partial<DeckAtlas> = deckAtlas;
  const selectedChapter: DeckChapter | undefined = chapters.find((chapter) => chapter.id === id);
  const { name, places, chapterName }: Partial<DeckChapter> = selectedChapter ?? initialChapter;

  /**
   * Update the progress when being viewed
   */
  useFocusEffect(
    useCallback(() => {
      let shouldUpdateState = true;

      async function getPlaceProgress() {
        const result: PlaceProgressById = {};

        if (Array.isArray(places)) {
          try {
            if (userId) {
              for (const place of places) {
                result[ place.id ] = await getDecksProgress({
                  decks: place.decks,
                  userId,
                });
              }
            }
          } catch (error) {
            console.error('Could not retrieve place progress:', error);
          }
        }

        if (shouldUpdateState) setPlaceProgressById(result);
      }

      setPlaceProgressById({});
      getPlaceProgress();

      return () => {
        shouldUpdateState = false;
      };
    }, [ places, userId ])
  );

  /**
   * In case we are routed here without state
   */
  if (!selectedChapter) {
    return (
      <View style={styles.viewStyle}>
        <View style={styles.chapterTitleContainerStyle}>
          <Text style={styles.chapterIndexStyle}>Unknown chapter</Text>
          <Text style={styles.chapterTitleStyle}>Please go back and select a chapter.</Text>
        </View>
      </View>
    );
  }

  /**
   * Render the card grid
   */
  return (
    <View style={viewStyle}>
      <View style={chapterTitleContainerStyle}>
        <Text style={chapterIndexStyle}>{chapterName}</Text>
        <Text style={chapterTitleStyle}>{name}</Text>
      </View>
      <ScrollView contentContainerStyle={chapterContainerStyle}>
        {
          /**
          * Map the chapter's places
          */
          places?.map((place: DeckPlace, index: number) => {
            const isEven = index % 2 === 0;
            const rotate = isEven ? '-5deg' : '5deg';
            const reverseRotate = isEven ? '5deg' : '-5deg';
            const { id: placeId, name, description, image } = place;
            const progressPercent = placeProgressById[ placeId ] ?? 0;

            /**
             * Render the place view/card
             */
            return (
              <View key={placeId} style={placeContainerStyle}>
                <Text style={placeTitleTextStyle}>{name}</Text>
                <View
                  style={[ polaroidContainerStyle, { transform: [ { rotate: reverseRotate } ] } ]}
                >
                  <View style={[ polaroid, { transform: [ { rotate } ] } ]}>
                    <Image
                      source={image}
                      style={placeImageStyle}
                    />
                    <Text style={placeDescriptionTextStyle}>{description}</Text>
                    <View style={progressContainerStyle}>
                      <Text style={progressTextStyle}>Progress {progressPercent}%</Text>
                      <View style={progressBarsContainer}>
                        <LinearGradient
                          style={[ progressBarStyle, { width: `${progressPercent}%`, borderRightWidth: 1 } ]}
                          colors={polaroidColors}
                          locations={polaroidColorStops}
                        />
                        <LinearGradient
                          style={[ progressBarStyle, { position: 'absolute', width: '100%', opacity: 0.15 } ]}
                          colors={polaroidColors}
                          locations={polaroidColorStops}
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <LinkButton
                  hitSlop={10}
                  arrowSize={16}
                  contentPaddingHorizontal={48}
                  contentPaddingVertical={14}
                  style={placeSelectButtonStyle}
                  screen={'(routes)/CardDeckSelect'}
                  params={{ placeId }}
                >
                  <Text style={placeSelectButtonTextStyle}>View Decks</Text>
                </LinkButton>
              </View>
            );
          })
        }
      </ScrollView>
    </View>
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
  viewStyle: {
    flex: 1,
    backgroundColor: colors.dark.text,
  },
  chapterTitleContainerStyle: {
    paddingHorizontal: containerMargin,
    paddingVertical: 16,
    backgroundColor: colors.dark.text,
    borderBottomWidth: 1,
    borderColor: colors.dark.text
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
  chapterContainerStyle: {
    display: 'flex',
    backgroundColor: colors.dark.text,
    gap: 8,
    paddingBottom: 8,
  },
  placeContainerStyle: {
    padding: containerMargin,
    gap: containerMargin,
    marginHorizontal: 8,
    backgroundColor: colors.dark.background,
    borderRadius: 8
  },
  placeTitleTextStyle: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    fontSize: 18,
    textAlign: 'center',
  },
  polaroidContainerStyle: {
    display: 'flex',
    backgroundColor: colors.light.polaroid,
    borderRadius: 2,
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
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.light.border,
    padding: 12,
  },
  placeImageStyle: {
    width: '100%',
    height: 200,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.dark.border
  },
  placeDescriptionTextStyle: {
    padding: 8,
    fontFamily: 'shadows-400',
    fontSize: 16,
  },
  progressContainerStyle: {
    paddingHorizontal: 8,
    paddingTop: 4
  },
  progressTextStyle: {
    fontFamily: 'shadows-400',
    fontSize: 12,
  },
  progressBarsContainer: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: colors.light.border,
  },
  progressBarStyle: {
    width: '10%',
    height: 8,
    borderColor: colors.light.border
  },
  placeSelectButtonStyle: {
    marginBottom: 4,
    marginHorizontal: 16
  },
  placeSelectButtonTextStyle: {
    fontSize: 14,
  }
});
