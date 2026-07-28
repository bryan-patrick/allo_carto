import type { PropsWithChildren } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function Cover({ children }: PropsWithChildren) {
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/cover.jpg')}
      style={styles.cover}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  cover: {
    flexGrow: 1,
    flexShrink: 1,
    height: '100%',
  },
});
