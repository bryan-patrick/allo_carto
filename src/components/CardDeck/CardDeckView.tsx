import sharedStyles from '@/src/app/sharedStyles';
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
 * Destructure shared style values
 */
const {
  containerMargin
} = sharedStyles;

/**
 * Styles
 */
const cardDeckViewStyles = StyleSheet.create({
  wordCardAnimatedView: {
    margin: containerMargin,
    flex: 1,
    position: 'relative',
  },
});
