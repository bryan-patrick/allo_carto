import type { DeckChapter } from '@/data/french/deckAtlas';
import colors from '@/src/app/colors';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Book from './Book';
import ChapterMeta from './ChapterMeta';
import ChapterSelectButton from './ChapterSelectButton';
import Cover from './Cover';
import Crease from './Crease';
import Spine from './Spine';

interface ChapterProps {
  chapter: DeckChapter;
  progressPercent: number;
}

export default function Chapter({ chapter, progressPercent }: ChapterProps) {
  const { chapterName, image, name } = chapter;

  return (
    <Book>
      <Spine />
      <Crease />
      <Cover>
        <View style={styles.container}>
          <View style={styles.inner}>
            <View style={styles.titleContainer}>
              <Text style={styles.chapterName}>{chapterName}</Text>
              <Text style={styles.title}>{name}</Text>
            </View>
            <View style={styles.imageContainer}>
              <ImageBackground source={image} style={styles.image} />
            </View>
            <ChapterMeta progressPercent={progressPercent} />
            <ChapterSelectButton chapterId={chapter.id} />
          </View>
        </View>
      </Cover>
    </Book>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
  },
  inner: {
    alignItems: 'center',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  titleContainer: {
    flexShrink: 1,
    wordWrap: 'wrap',
  },
  chapterName: {
    color: colors.dark.text,
    fontFamily: 'lexend-400',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
    fontSize: 20,
    textAlign: 'center',
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
    marginRight: 8,
    shadowColor: colors.dark.text,
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  image: {
    height: 200,
    width: 260,
  },
});
