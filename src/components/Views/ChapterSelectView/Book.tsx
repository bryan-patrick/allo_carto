import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Book({ children }: PropsWithChildren) {
  return <View style={styles.book}>{children}</View>;
}

const styles = StyleSheet.create({
  book: {
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
});
