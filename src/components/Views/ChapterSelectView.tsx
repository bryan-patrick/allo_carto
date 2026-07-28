import type { DeckChapter } from "@/data/french/deckAtlas";
import { deckAtlas } from "@/data/french/deckAtlas";
import { useUserContext } from "@/src/db/useUserContext";
import getChapterProgressPercent from "@/src/util/getDecksProgress";
import { useFocusEffect } from "expo-router";
import { ReactNode, useCallback, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import LinkButton from "../LinkButton";

/**
 * Typing
 */
interface ChapterProgressById {
  [ chapterId: string ]: number;
}

interface BookPartProps {
  children: ReactNode;
}

/**
 * ChapterSelectView component
 */
export default function ChapterSelectView() {
  const user = useUserContext();
  const { chapters } = deckAtlas;
  const [ chapterProgressById, setChapterProgressById ] = useState<ChapterProgressById>({});

  /**
   * Refresh chapter progress whenever this view opens.
   * Same pattern we've used before to avoid race conditions.
   */
  useFocusEffect(
    useCallback(() => {
      let shouldUpdateState = true;

      async function getChapterProgress() {
        const result: ChapterProgressById = {};

        try {
          if (user?.id) {
            for (const chapter of chapters) {
              const progressPercent: number = await getChapterProgressPercent({
                chapter,
                userId: user.id,
              });

              result[ chapter.id ] = progressPercent;
            }
          }
        } catch (error) {
          console.error('Could not retrieve chapter progress:', error);
        }

        if (shouldUpdateState) {
          setChapterProgressById(result);
        }
      }

      setChapterProgressById({});
      getChapterProgress();

      return () => {
        shouldUpdateState = false;
      };
    }, [ chapters, user?.id ])
  );

  /**
   * Destructure styles
   */
  const {
    scrollViewContainerStyle,
    chapterContainerStyle,
    chapterContainerInnerStyle,
    chapterTitleContainerStyle,
    chapterIndexStyle,
    chapterTitleStyle,
    ChapterSelectButtonTextStyle,
    chapterImageContainerStyle,
    chapterImageStyle
  } = styles;

  /**
   * Build the scrollview. 
   * Special note that ScrollView style has the bg color
   * because of bounce (user pulling the scroll down into overflow).
   */
  return (
    <ScrollView style={{ backgroundColor: colors.dark.text }} contentContainerStyle={scrollViewContainerStyle}>
      {
        /**
         * Map the chapters
         */
        chapters.map((chapter: DeckChapter, index) => {

          /**
           * Destructure the current chapter
           */
          const { id: chapterId, name, chapterName, image } = chapter;

          /**
           * Completion percentage
           */
          const progressPercent = chapterProgressById[ chapterId ] ?? 0;

          /**
           * Render the individual chapter sections
           */
          return (
            <View key={`${index}-${chapterId}`}>
              <Book>
                <Spine />
                <Crease />
                <Cover>
                  <View style={chapterContainerStyle}>
                    <View style={chapterContainerInnerStyle}>
                      <View style={chapterTitleContainerStyle}>
                        <Text style={chapterIndexStyle}>{chapterName}</Text>
                        <Text style={chapterTitleStyle}>{name}</Text>
                      </View>
                      <View style={chapterImageContainerStyle}>
                        <ImageBackground style={chapterImageStyle} source={image} />
                      </View>
                      <ChapterMeta progressPercent={progressPercent} />
                      <ChapterSelectButton chapterId={chapterId}>
                        <Text style={ChapterSelectButtonTextStyle}>View This Chapter</Text>
                      </ChapterSelectButton>
                    </View>
                  </View>
                </Cover>
              </Book>

            </View>
          );
        })
      }
    </ScrollView>
  );
}

/**
 * Three piece book background
 */
function Book({ children }: BookPartProps) {
  const { bookStyle } = styles;

  return <View style={bookStyle}>{children}</View>;
}

/**
 * The spine of the book
 */
function Spine() {
  const {
    spineStyle,
  } = styles;

  return (
    <ImageBackground
      source={require('../../app/assets/images/book-parts/spine.jpg')}
      style={spineStyle}
      resizeMode="stretch"
    />
  );
}

/**
 * The cover or background
 */
function Cover({ children }: BookPartProps) {
  const {
    coverStyle,
  } = styles;

  return (
    <ImageBackground
      source={require('../../app/assets/images/book-parts/cover.jpg')}
      style={coverStyle}
      resizeMode="stretch"
    >
      {children}
    </ImageBackground>
  );
}

/**
 * This graphic separates the cover from the spine
 */
function Crease() {
  const {
    creaseStyle,
  } = styles;

  return (
    <ImageBackground
      source={require('../../app/assets/images/book-parts/crease.jpg')}
      style={creaseStyle}
      resizeMode="stretch"
    />
  );
}

/**
 * Plooooo typing
 */
interface ChapterSelectButtonProps {
  chapterId: string;
  children: ReactNode;
}

function ChapterSelectButton({ chapterId, children }: ChapterSelectButtonProps) {
  /**
   * Destructure styles
   */
  const { ChapterSelectButtonStyle } = styles;

  return (
    <LinkButton
      hitSlop={10}
      arrowSize={16}
      screen="(routes)/PlaceSelect"
      params={{ chapterId }}
      style={ChapterSelectButtonStyle}
    >
      {children}
    </LinkButton>
  );
}

/**
 * Encore ploousssss typing
 */
interface ChapterMetaProps {
  progressPercent: number;
}

function ChapterMeta({ progressPercent }: ChapterMetaProps) {
  const {
    metaContainerStyle,
    metaRowStyle,
    metaTextStyle,
    metaDataStyle
  } = styles;

  return (
    <View style={metaContainerStyle}>
      <View style={metaRowStyle}>
        <Text style={metaTextStyle}>Chapter progress:&nbsp;</Text>
        <Text style={metaDataStyle}>{progressPercent}%</Text>
      </View>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  bookStyle: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  spineStyle: {
    width: 40,
  },
  creaseStyle: {
    width: 10,
  },
  coverStyle: {
    flexShrink: 1,
    flexGrow: 1,
    height: '100%'
  },
  coverMiddleStyle: {
    width: '100%',
    justifyContent: 'center',
  },
  chapterWelcomeContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  chapterWelcomeTextStyle: {
    fontSize: 20,
    fontFamily: 'lexend-600',
    color: colors.light.text
  },
  scrollViewContainerStyle: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 16,
  },
  chapterContainerStyle: {
    marginHorizontal: 8,
  },
  chapterContainerInnerStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 16,
    borderRadius: 8
  },
  chapterTitleContainerStyle: {
    flexShrink: 1, // Need this for long titles
    wordWrap: 'wrap', // titles to handle overflow
  },
  chapterIndexStyle: {
    fontSize: 12,
    color: colors.dark.text,
    fontFamily: 'lexend-400',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  chapterTitleStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    textAlign: 'center',
    fontSize: 20,
  },
  ChapterSelectButtonStyle: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    marginBottom: 4,
  },
  ChapterSelectButtonTextStyle: {
    fontSize: 14,
  },
  metaContainerStyle: {
    //backgroundColor: 'yellow'
  },
  metaRowStyle: {
    display: 'flex',
    flexDirection: 'row',
  },
  metaTextStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600'
    //backgroundColor: 'blue'
  },
  metaDataStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600'
    //backgroundColor: 'turquoise'
  },
  chapterImageContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    shadowColor: colors.dark.text,
    marginRight: 8, // Match the shadow offset width
    marginBottom: 8, // Match the shadow offset height
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  chapterImageStyle: {
    height: 200,
    width: 260
  },
});
