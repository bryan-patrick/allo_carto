import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import chapterSelectSharedStyles from './sharedStyles';

/**
 * Typing
 */
interface CoverProps {
  children: ReactNode;
}

/**
 * The "cover" of the book. This includes the image of the chapter.
 */
export default function Cover({ children }: CoverProps) {
  const { coverStyle, coverInnerStyle } = styles;
  const { borderStyle } = chapterSelectSharedStyles;

  /**
   * Render the component
   */
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/cover.jpg')}
      style={[ coverStyle, borderStyle ]}
    >
      <View style={coverInnerStyle}>
        {children}
      </View>
    </ImageBackground>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  coverStyle: {
    flexGrow: 1,
    flexShrink: 1,
    padding: 8,
    paddingLeft: 0,
  },
  coverInnerStyle: {
    borderWidth: 4,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    borderLeftWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  }
});
