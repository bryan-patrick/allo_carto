import { Text, View } from 'react-native';
import styles from '../styles';

export default function Settings() {
  const { text } = styles;

  return (
    <View>
      <Text style={text}>SALUT MONDE (settings)</Text>
    </View>
  )
}