import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import LinkCard from '../components/LinkCard';
import SVGCards from '../components/SVG/SVGCards';
import styles, { colors } from '../styles';


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinkCard
        screen="deck"
        title="Learn more words!"
        linkText="Review a deck →"
        description="Generate a deck of new words to work on"
        SVGElement={<SVGCards height={'120px'} width={'130px'} color={colors.dark.secondary} />}
      />
    </View>
  );
}

