import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LinkCard from '../../components/LinkCard';
import SVGCards from '../../components/SVG/SVGCards';
import colors from '../colors';

/**
 * HomeScreen view - Index of the (tabs) dir routes
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinkCard
        screen="(routes)/PlaceSelect"
        title="Learn more words!"
        linkText="Review a deck →"
        description="Generate a deck of new words to work on"
        SVGElement={<SVGCards height={'120px'} width={'130px'} color={colors.dark.secondary} />}
      />
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    margin: 24,
    gap: 24,
  },
});