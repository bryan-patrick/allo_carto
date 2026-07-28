import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Typing
 */
interface BookProps {
  children: ReactNode;
}

/**
 * Book component (chapter select)
 */
export default function Book({ children }: BookProps) {
  const { bookStyle } = styles;

  /**
   * Render the component
   */
  return <View style={bookStyle}>{children}</View>;
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  bookStyle: {
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
});
