import { DeckChapter } from '@/data/french/deckAtlas';
import LinkButton from '@/src/components/LinkButton';
import { StyleSheet, Text } from 'react-native';

/**
 * Typing
 */
interface ChapterSelectButtonProps {
  chapter: DeckChapter;
}

/**
 * Chapter select button
 */
export default function ChapterSelectButton({ chapter }: ChapterSelectButtonProps) {
  const { id, color } = chapter;

  /**
   * Destructure styles
   */
  const {
    chapterSelectButtonTextStyle,
  } = styles;

  /**
   * Render the component
   */
  return (
    <LinkButton
      arrowSize={16}
      hitSlop={10}
      params={{ id }}
      screen="(routes)/PlaceSelect"
      color={color}
      fullwidth
    >
      <Text style={chapterSelectButtonTextStyle}>View This Chapter</Text>
    </LinkButton>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  chapterSelectButtonTextStyle: {
    fontSize: 14,
  },
});
