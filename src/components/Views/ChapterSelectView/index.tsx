import type { DeckChapter } from '@/data/french/deckAtlas';
import { deckAtlas } from '@/data/french/deckAtlas';
import colors from '@/src/app/colors';
import { useUserContext } from '@/src/db/useUserContext';
import getChapterProgressPercent from '@/src/util/getDecksProgress';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Chapter from './Chapter';

interface ChapterProgressById {
  [ chapterId: string ]: number;
}

export default function ChapterSelectView() {
  const user = useUserContext();
  const { chapters } = deckAtlas;
  const [ chapterProgressById, setChapterProgressById ] = useState<ChapterProgressById>({});

  useFocusEffect(
    useCallback(() => {
      let shouldUpdateState = true;

      async function getChapterProgress() {
        const result: ChapterProgressById = {};

        try {
          if (user?.id) {
            for (const chapter of chapters) {
              const progressPercent = await getChapterProgressPercent({
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

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      style={styles.scrollView}
    >
      {chapters.map((chapter: DeckChapter) => (
        <Chapter
          chapter={chapter}
          key={chapter.id}
          progressPercent={chapterProgressById[ chapter.id ] ?? 0}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.dark.text,
  },
  scrollViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 16,
  },
});
