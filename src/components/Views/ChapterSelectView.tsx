import type { DeckChapter } from "@/data/french/deckAtlas";
import { deckAtlas } from "@/data/french/deckAtlas";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../../app/colors";
import sharedStyles from "../../app/sharedStyles";
import LinkButton from "../LinkButton";

/**
 * ChapterSelectView component
 */
export default function ChapterSelectView() {
  const { chapters } = deckAtlas;

  /**
 * Destructure styles
 */
  const {
    chapterContainerStyle,
    chapterConatainerInnerStyle,
    chapterTitleContainerStyle,
    chapterIndexStyle,
    chapterTitleStyle,
    ChapterSelectButtonTextStyle
  } = styles;

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
          const { id: chapterId, name, chapterName } = chapter;

          /**
           * Render the individual chapter sections
           */
          return (
            <View style={chapterContainerStyle} key={`${index}-${chapterId}`}>
              <View style={chapterConatainerInnerStyle}>
                <View style={chapterTitleContainerStyle}>
                  <Text style={chapterIndexStyle}>{chapterName}</Text>
                  <Text style={chapterTitleStyle}>{name}</Text>
                </View>
                <ChapterMeta />
                <ChapterSelectButton chapterId={chapterId}>
                  <Text style={ChapterSelectButtonTextStyle}>Select</Text>
                </ChapterSelectButton>
              </View>
            </View>
          )
        })
      }
    </ScrollView >
  )
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
  const { ChapterSelectButtonStyle } = styles

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
  )
}

/**
 * Encore ploousssss typing
 */
interface ChapterMetaProps {
  ts?: string
}

function ChapterMeta({ ts }: ChapterMetaProps) {
  const {
    metaContainerStyle,
    metaRowStyle,
    metaTextStyle,
    metaDataStyle
  } = styles;

  return (
    <View style={metaContainerStyle}>
      <View style={metaRowStyle}>
        <Text style={metaTextStyle}>Decks completed:</Text>
        <Text style={metaDataStyle}>0/12</Text>
      </View>
    </View>
  )
}

const { containerMargin } = sharedStyles

/**
 * Styles
 */
const styles = StyleSheet.create({
  chapterContainerStyle: {
    display: 'flex',
    borderRadius: 8,
    margin: containerMargin,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.light.text,
    padding: 24,
    marginBottom: 0,
    backgroundColor: colors.light.background
  },
  chapterConatainerInnerStyle: {
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterTitleContainerStyle: {
    flexShrink: 1, // Need these for long
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
    fontSize: 18,
  },
  ChapterSelectButtonStyle: {
    padding: 14,
    paddingRight: 48,
    paddingLeft: 48,
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
    //backgroundColor: 'blue'
  },
  metaDataStyle: {
    //backgroundColor: 'turquoise'
  }
});
