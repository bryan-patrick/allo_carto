import { ImageBackground, StyleSheet } from 'react-native';

export default function Crease() {
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/crease.jpg')}
      style={styles.crease}
    />
  );
}

const styles = StyleSheet.create({
  crease: {
    width: 10,
  },
});
