import { useEffect, useReducer } from 'react';
import WordCardContainer from '../WordCard/WordCardContainer';
import { CardDeckContext, cardDeckReducer, initialCardDeckState } from './cardDeckContext';

/**
 * CardDeckView component
 */
export default function CardDeckView() {
  const [cardDeckState, cardDeckDispatch] = useReducer(cardDeckReducer, initialCardDeckState);

  /**
   * Get a card deck (async)
   */
  useEffect(() => {
    cardDeckDispatch({ type: 'get_a_deck' });
  }, []);

  /**
   * Render the card deck
   * 
   */
  return (
    <CardDeckContext.Provider value={{
      cardDeckState: cardDeckState,
      cardDeckDispatch: cardDeckDispatch
    }}>
      {
        cardDeckState.cardDeck.map(wordCard => {
          const currentCard = cardDeckState.cardDeck[cardDeckState.currentIndex];

          return (
            <WordCardContainer
              key={wordCard.id}
              word={wordCard}
              isCurrent={wordCard.id === currentCard.id}
            />
          )
        })
      }
    </CardDeckContext.Provider>
  );
}
