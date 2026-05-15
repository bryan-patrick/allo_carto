import { View } from 'react-native';
import LinkButton from '../components/LinkButton';
import SVGQuiz from '../components/svg/SVGQuiz';
import { colors } from '../styles';

export default function HomeScreen() {
  return (
    <View>
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

