import type { DeckChapter } from '@/data/french/deckAtlas';
import { deckAtlas } from '@/data/french/deckAtlas';
import { useUserContext } from '@/src/db/useUserContext';
import getChapterProgressPercent from '@/src/util/getDecksProgress';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Chapter from './Chapter';

/**
 * Typing
 */
interface ChapterProgressById {
  [ chapterId: string ]: number;
}

/**
 * Component chapter select view
 */
export default function ChapterSelectView() {
  const userId = useUserContext()?.id;
  const { chapters } = deckAtlas;
  const [ chapterProgressById, setChapterProgressById ] = useState<ChapterProgressById>({});
  const {
    scrollViewStyle,
    scrollViewContainerStyle,
  } = styles;

  useFocusEffect(
    useCallback(() => {
      let shouldUpdateState = true;

      async function getChapterProgress() {
        const result: ChapterProgressById = {};

        try {
          if (userId) {
            for (const chapter of chapters) {
              const progressPercent = await getChapterProgressPercent({
                chapter,
                userId,
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
    }, [ chapters, userId ])
  );

  /**
   * Render the component
   */
  return (
    <ScrollView
      style={scrollViewStyle}
      contentContainerStyle={scrollViewContainerStyle}
    >
      {chapters.map((chapter: DeckChapter, index) => (
        <Chapter
          chapter={chapter}
          index={index}
          key={chapter.id}
          progressPercent={chapterProgressById[ chapter.id ] ?? 0}
        />
      ))}
    </ScrollView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  scrollViewStyle: {
  },
  scrollViewContainerStyle: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    paddingVertical: 24,
  },
});
