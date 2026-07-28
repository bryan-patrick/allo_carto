import LinkButton from '@/src/components/LinkButton';
import { StyleSheet, Text } from 'react-native';

/**
 * Typing
 */
interface ChapterSelectButtonProps {
  chapterId: string;
}

/**
 * Chapter select button
 */
export default function ChapterSelectButton({ chapterId }: ChapterSelectButtonProps) {
  const {
    chapterSelectButtonStyle,
    chapterSelectButtonTextStyle,
  } = styles;

  /**
   * Render the component
   */
  return (
    <LinkButton
      arrowSize={16}
      hitSlop={10}
      params={{ chapterId }}
      screen="(routes)/PlaceSelect"
      style={chapterSelectButtonStyle}
    >
      <Text style={chapterSelectButtonTextStyle}>View This Chapter</Text>
    </LinkButton>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  chapterSelectButtonStyle: {
    marginBottom: 4,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  chapterSelectButtonTextStyle: {
    fontSize: 14,
  },
});
