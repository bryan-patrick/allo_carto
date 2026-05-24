/**
 * This is the canonical deck (and card) data 
 * This context handles card data
 */
import { useEffect, useReducer } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import WordCardContainer from '../WordCard/WordCardContainer';
import { CardDeckContext, cardDeckReducer, initialCardDeckState } from './cardDeckContext';

/**
 * CardDeckView component
 */
export default function CardDeckView() {
  const [cardDeckState, cardDeckDispatch] = useReducer(cardDeckReducer, initialCardDeckState);
  const currentCard = cardDeckState.cardDeck[cardDeckState.currentIndex];

  /**
   * Destructure styles
   */
  const { wordCardAnimatedView } = cardDeckViewStyles;

  /**
   * Get a card deck (async)
   */
  useEffect(() => {
    cardDeckDispatch({ type: 'GET_DECK' });
  }, []);

  /**
   * Render the card deck
   */
  return (
    <CardDeckContext.Provider value={{
      cardDeckState,
      cardDeckDispatch
    }}>
      {
        currentCard && (
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
        )
      }
    </CardDeckContext.Provider>
  );
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
