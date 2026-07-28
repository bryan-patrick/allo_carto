import { ImageBackground, StyleSheet } from 'react-native';

/**
 * The graphical Crease (of the book)
 */
export default function Crease() {
  const { creaseStyle } = styles;

  /**
   * Render the component
   */
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/crease.jpg')}
      style={creaseStyle}
    />
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  creaseStyle: {
    width: 10,
  },
});
