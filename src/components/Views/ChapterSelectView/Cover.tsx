import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

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
  const { coverStyle } = styles;

  /**
   * Render the component
   */
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/cover.jpg')}
      style={coverStyle}
    >
      {children}
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
    height: '100%',
  },
});
