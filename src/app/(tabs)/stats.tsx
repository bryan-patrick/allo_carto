import { Text, View } from 'react-native';
import styles from '../styles';

export default function Stats() {
  const { text } = styles;

  return (
    <View>
      <Text style={text}>SALUT MONDE (stats)</Text>
    </View>
  )
}