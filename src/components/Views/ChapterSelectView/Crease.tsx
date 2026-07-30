import { ImageBackground, StyleSheet, View } from 'react-native';
import chapterSelectSharedStyles from './sharedStyles';

/**
 * The graphical Crease (of the book)
 */
export default function Crease() {
  const { creaseStyle, innerBorder } = styles;
  const { borderStyle } = chapterSelectSharedStyles;

  /**
   * Render the component
   */
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/crease.jpg')}
      style={[ creaseStyle, borderStyle ]}
    ><View style={innerBorder} /></ImageBackground>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  creaseStyle: {
    width: 10,
    paddingTop: 8,
    paddingBottom: 8,
    display: 'flex'
  },
  innerBorder: {
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    flexGrow: 1,
  }
});
