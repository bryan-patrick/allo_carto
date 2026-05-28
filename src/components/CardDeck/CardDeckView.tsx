import { StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import WordCardContainer from '../WordCard/WordCardContainer';
import { Word } from './cardDeckTypes';

/**
 * Typing
 */
interface CardDeckViewProps {
  currentCard: Word;
}

/**
 * CardDeckView component
 */
export default function CardDeckView({ currentCard }: CardDeckViewProps) {
  /**
   * Destructure styles
   */
  const { wordCardAnimatedView } = cardDeckViewStyles;

  /**
   * Render the card deck
   */
  return ((
    <Animated.View
      key={currentCard.id}
      entering={SlideInRight.duration(200)}
      exiting={SlideOutLeft.duration(200)}
      style={wordCardAnimatedView}
    >
      <WordCardContainer
        word={currentCard}
        isCurrent={true}
      />
    </Animated.View>
  ));
}

/**
 * Styles
 */
const cardDeckViewStyles = StyleSheet.create({
  wordCardAnimatedView: {
    flex: 1,
    position: 'relative',
  },
});
