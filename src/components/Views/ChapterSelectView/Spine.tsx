import { ImageBackground, StyleSheet } from 'react-native';

/**
 * The spine graphic component (of the book)
 */
export default function Spine() {
  const { spineStyle } = styles;

  /**
   * Render the component
   */
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/spine.jpg')}
      style={spineStyle}
    />
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  spineStyle: {
    width: 40,
  },
});
