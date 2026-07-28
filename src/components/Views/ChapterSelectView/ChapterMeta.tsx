import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';

interface ChapterMetaProps {
  progressPercent: number;
}

export default function ChapterMeta({ progressPercent }: ChapterMetaProps) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.text}>Chapter progress:&nbsp;</Text>
        <Text style={styles.data}>{progressPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  text: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
  },
  data: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
  },
});
