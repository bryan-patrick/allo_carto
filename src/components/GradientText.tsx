import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextStyle } from 'react-native';

/**
 * Typing
 */
interface GradientTextProps {
  colors: readonly [string, string, ...string[]],
  fontSize: number,
  fontWeight?: TextStyle['fontWeight'],
  style?: TextStyle,
  text: string
}

/**
 * GradientText component
 */
export default function GradientText({ colors, fontSize, fontWeight, style, text }: GradientTextProps) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const textStyle = StyleSheet.flatten([
    style,
    {
      fontSize,
      fontWeight: fontWeight ?? flattenedStyle.fontWeight,
    },
  ]);

  return (
    <MaskedView
      maskElement={
        <Text style={textStyle}>
          {text}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
      >
        <Text style={[textStyle, styles.hiddenText]}>
          {text}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  hiddenText: {
    opacity: 0,
  },
});
