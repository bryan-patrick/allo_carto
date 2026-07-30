import { Image, StyleSheet, View } from 'react-native';

interface SpineProps {
  color?: string;
}

/**
 * The spine graphic component (of the book)
 */
export default function Spine({ color }: SpineProps) {
  const { spineColorStyle, spineImageStyle, spineStyle, spineShadeStyle } = styles;

  /**
   * Render the component
   */
  return (
    <View style={spineStyle}>
      <Image
        resizeMode="stretch"
        source={require('../../../app/assets/images/book-parts/spine.jpg')}
        style={spineImageStyle}
      />
      {color && (
        <View
          pointerEvents="none"
          style={[ spineColorStyle, { backgroundColor: color } ]}
          testID="spine-color-overlay"
        />
      )}
      {color && (
        <View
          pointerEvents="none"
          style={spineShadeStyle}
          testID="spine-shade-overlay"
        />
      )}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  spineColorStyle: {
    bottom: 0,
    left: 0,
    mixBlendMode: 'color',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  spineImageStyle: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  spineShadeStyle: {
    backgroundColor: '#000000',
    bottom: 0,
    left: 0,
    opacity: 0.4,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  spineStyle: {
    isolation: 'isolate',
    width: 60,
  },
});
