import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

/**
 * Typing
 */
interface GradientTextProps {
  colors: string[],
  fontSize: number,
  fontWeight?: 400 | 600 | 700,
  text: string
}

/**
 * GradientText component
 */
export default function GradientText({ colors, fontSize, fontWeight = 400, text }: GradientTextProps) {
  const textStyle = {
    fontFamily: getLexendFontFamily(fontWeight),
    fontSize,
  };

  return (
    <MaskedView
      testID="gradient-text-mask"
      maskElement={
        <Text style={textStyle}>
          {text}
        </Text>
      }
    >
      <LinearGradient
        testID="gradient-text-fill"
        colors={colors as any}
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

function getLexendFontFamily(fontWeight: GradientTextProps['fontWeight']) {
  if (fontWeight === 700) {
    return 'lexend-700';
  }

  return fontWeight === 600 ? 'lexend-600' : 'lexend-400';
}
