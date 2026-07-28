import { ImageBackground, StyleSheet } from 'react-native';

export default function Spine() {
  return (
    <ImageBackground
      resizeMode="stretch"
      source={require('../../../app/assets/images/book-parts/spine.jpg')}
      style={styles.spine}
    />
  );
}

const styles = StyleSheet.create({
  spine: {
    width: 40,
  },
});
