import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import LinkButton from '../components/LinkButton';
import LinkCard from '../components/LinkCard';
import SVGCards from '../components/svg/SVGCards';
import SVGQuiz from '../components/svg/SVGQuiz';
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
      <LinkButton
        screen="deck"
        params={{ href: '/' }}
        SVGElement={<SVGQuiz height={'100px'} width={'100%'} color={colors.light.secondary} />}
      >
        Review a Deck
      </LinkButton>
    </View>
  );
}

