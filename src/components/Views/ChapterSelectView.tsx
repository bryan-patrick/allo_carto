import type { DeckChapter } from "@/data/french/deckAtlas";
import { deckAtlas } from "@/data/french/deckAtlas";
import { useUserContext } from "@/src/db/useUserContext";
import getChapterProgressPercent from "@/src/util/chapterProgress";
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

  return (
    <ScrollView contentContainerStyle={scrollViewContainerStyle}>
      {
        /**
         * Map the chapters
         */
        chapters.map((chapter: DeckChapter, index) => {

          /**
           * Destructure the chapters
           */
          const { id: chapterId, name, chapterName, image } = chapter;

          /**
           * Completion
           */
          const progressPercent = chapterProgressById[ chapterId ] ?? 0;

          /**
           * Render the individual chapter sections
           */
          return (
            <View style={chapterContainerStyle} key={`${index}-${chapterId}`}>
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
                  <Text style={ChapterSelectButtonTextStyle}>Select</Text>
                </ChapterSelectButton>
              </View>
            </View>
          );
        })
      }
    </ScrollView >
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
  scrollViewContainerStyle: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: colors.dark.text,
  },
  chapterContainerStyle: {
    marginHorizontal: 8,
  },
  chapterContainerInnerStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark.background,
    paddingVertical: 32,
    paddingHorizontal: 16,
    gap: 8,
  },
  chapterTitleContainerStyle: {
    flexShrink: 1, // Need this for long titles
    wordWrap: 'wrap', // titles to handle overflow
  },
  chapterIndexStyle: {
    fontSize: 12,
    color: colors.light.text,
    fontFamily: 'lexend-400',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  chapterTitleStyle: {
    color: colors.light.text,
    fontFamily: 'lexend-600',
    fontSize: 18,
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
    color: colors.light.text,
    fontFamily: 'lexend-600'
    //backgroundColor: 'blue'
  },
  metaDataStyle: {
    color: colors.light.text,
    fontFamily: 'lexend-600'
    //backgroundColor: 'turquoise'
  },
  chapterImageContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chapterImageStyle: {
    height: 340,
    width: '100%',
  }
});
