import type { DeckChapter } from '@/data/french/deckAtlas';
import colors from '@/src/app/colors';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Book from './Book';
import ChapterMeta from './ChapterMeta';
import ChapterSelectButton from './ChapterSelectButton';
import Cover from './Cover';
import Crease from './Crease';
import Spine from './Spine';

/**
 * Typing
 */
interface ChapterProps {
  chapter: DeckChapter;
  progressPercent: number;
}

/**
 * Chapter component
 */
export default function Chapter({ chapter, progressPercent }: ChapterProps) {
  const { chapterName, image, name, color } = chapter;
  const {
    chapterContainerStyle,
    chapterContainerInnerStyle,
    chapterTitleContainerStyle,
    chapterNameStyle,
    chapterTitleStyle,
    chapterImageContainerStyle,
    chapterImageStyle,
  } = styles;

  /**
   * Render the component
   */
  return (
    <Book>
      <Spine color={color} />
      <Crease />
      <Cover>
        <View style={chapterContainerStyle}>
          <View style={chapterContainerInnerStyle}>
            <View style={chapterTitleContainerStyle}>
              <Text style={chapterNameStyle}>{chapterName}</Text>
              <Text style={chapterTitleStyle}>{name}</Text>
            </View>
            <View style={chapterImageContainerStyle}>
              <ImageBackground source={image} style={chapterImageStyle} />
            </View>
            <ChapterMeta progressPercent={progressPercent} progressColor={color ?? '#000000'} />
            <ChapterSelectButton chapter={chapter} />
          </View>
        </View>
      </Cover>
    </Book>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  chapterContainerStyle: {
    marginHorizontal: 8,
  },
  chapterContainerInnerStyle: {
    alignItems: 'center',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  chapterTitleContainerStyle: {
    flexShrink: 1,
    wordWrap: 'wrap',
  },
  chapterNameStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-400',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  chapterTitleStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    fontSize: 20,
    textAlign: 'center',
  },
  chapterImageContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
    marginRight: 8,
    shadowColor: colors.dark.text,
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  chapterImageStyle: {
    height: 200,
    width: 260,
  },
});
