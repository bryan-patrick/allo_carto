import LinkButton from '@/src/components/LinkButton';
import { StyleSheet, Text } from 'react-native';

interface ChapterSelectButtonProps {
  chapterId: string;
}

export default function ChapterSelectButton({ chapterId }: ChapterSelectButtonProps) {
  return (
    <LinkButton
      arrowSize={16}
      hitSlop={10}
      params={{ chapterId }}
      screen="(routes)/PlaceSelect"
      style={styles.button}
    >
      <Text style={styles.text}>View This Chapter</Text>
    </LinkButton>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 4,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
  },
});
