import { useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  TextStyle,
  Text as TheActualReactNativeTextFFS,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as TheSVGTextIGuess,
  TSpan
} from 'react-native-svg';

/**
 * Typing
 */
interface GradientTextProps {
  colors: readonly string[],
  fontSize: number,
  fontWeight?: TextStyle['fontWeight'],
  style?: TextStyle,
  text: string
}

interface StopsMapProps {
  colors: readonly string[]
}

/**
 * Map SVG stops based on how many colors are provided.
 */
function StopsMap({ colors }: StopsMapProps) {
  const incrementBy = 100 / colors.length;
  let offset = 0;

  return (
    <LinearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%" gradientUnits="objectBoundingBox">
      {colors.map(color => {
        offset += incrementBy;

        return (
          <Stop key={color} stopColor={color} offset={`${offset}%`} />
        )
      })}
    </LinearGradient>
  )
}

/**
 * Note the svg might need width/height actually set. Which is annoying.
 */
export default function GradientText({ colors, fontSize, fontWeight, style, text }: GradientTextProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const fontSizeNum = Number(fontSize);
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const resolvedFontWeight = fontWeight ?? flattenedStyle.fontWeight;

  /**
   * I need this to cheat the SVG size.
   * I render the text as a <Text/> and then
   * steal the size from it and set that on the SVG.
   */
  const handleTextLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;

    setSize(() => ({ width, height }));
  };

  return (
    <View>
      <TheActualReactNativeTextFFS
        onLayout={handleTextLayout}
        style={[style, { fontSize: fontSizeNum, fontWeight: resolvedFontWeight }, styles.measureText]}
      >
        {text}
      </TheActualReactNativeTextFFS>
      <Svg
        height={size.height}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${size.width} ${size.height}`}
        width={size.width}
      >
        <Defs>
          <StopsMap colors={colors} />
        </Defs>
        <TheSVGTextIGuess fill="url(#gradient)" fontWeight={resolvedFontWeight}>
          <TSpan fontSize={fontSizeNum} x="0" dy={fontSizeNum}>{text}</TSpan>
        </TheSVGTextIGuess>
      </Svg>
    </View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  measureText: {
    opacity: 0,
  },
});
