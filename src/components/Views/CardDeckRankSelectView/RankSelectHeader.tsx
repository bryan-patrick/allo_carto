import { StyleSheet, Text, View } from 'react-native';
import type { CardDeck } from '../../CardDeck/cardDeckTypes';
import GradientText from '../../GradientText';

interface RankSelectHeaderProps {
  cardDeck: CardDeck;
}

export default function RankSelectHeader({ cardDeck }: RankSelectHeaderProps) {
  const { title } = cardDeck;
  const {
    titleRowStyle,
    titleTextStyle,
    descriptionTextStyle,
  } = styles;

  return (
    <>
      <View style={titleRowStyle}>
        <Text style={titleTextStyle}>Select the deck rank for</Text>
        <GradientText
          colors={[ cardDeck.colors.dark.primary, cardDeck.colors.dark.secondary ]}
          fontSize={20}
          fontWeight={700}
          text={title}
        />
      </View>
      <Text style={descriptionTextStyle}>
        Advance half the deck to unlock the next rank. Advance every card for full completion.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  titleRowStyle: {
    alignItems: 'center',
    display: 'flex',
    gap: 4,
  },
  titleTextStyle: {
    fontFamily: 'lexend-400',
    fontSize: 16,
    textAlign: 'center',
  },
  descriptionTextStyle: {
    fontFamily: 'lexend-400',
    fontSize: 14,
    paddingBottom: 8,
    textAlign: 'center',
  },
});
