import type { DeckChapter } from '@/data/french/deckAtlas';
import { deckAtlas } from '@/data/french/deckAtlas';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isProgressAccessible } from '@/src/util/atlasProgression';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Chapter from './Chapter';

/**
 * Component chapter select view
 */
export default function ChapterSelectView() {
  const { chapters } = deckAtlas;
  const { progressById, status } = useUserProgress();
  const {
    scrollViewStyle,
    scrollViewContainerStyle,
  } = styles;

  /**
   * Wait for progress
   */
  if (status === 'loading') return <Loader />;
  if (status === 'error') return <Text>Could not load chapter progress.</Text>;

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
          isLocked={!isProgressAccessible({ id: chapter.id, progressById })}
          key={chapter.id}
          progressPercent={progressById[ chapter.id ]?.completionPercentage ?? 0}
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
