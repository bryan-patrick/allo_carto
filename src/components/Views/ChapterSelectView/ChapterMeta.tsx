import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterMetaProps {
  progressPercent: number;
}

/**
 * Chapter meta component, currently only renders progress.
 */
export default function ChapterMeta({ progressPercent }: ChapterMetaProps) {
  const {
    metaRowStyle,
    metaTextStyle,
    metaDataStyle,
  } = styles;

  /**
   * Render the component
   */
  return (
    <View>
      <View style={metaRowStyle}>
        <Text style={metaTextStyle}>Chapter progress:&nbsp;</Text>
        <Text style={metaDataStyle}>{progressPercent}%</Text>
      </View>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  metaRowStyle: {
    display: 'flex',
    flexDirection: 'row',
  },
  metaTextStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
  },
  metaDataStyle: {
    color: colors.dark.text,
    fontFamily: 'lexend-600',
  },
});
