import { useEffect, useReducer } from 'react';
import { View } from 'react-native';
import WordCardContainer from '../WordCard/WordCardContainer';
import { DeckContext, deckReducer, initialDeckState } from './deckContext';

/**
 * DeckView component
 */
export default function DeckView() {
  const [deckState, deckDispatch] = useReducer(deckReducer, initialDeckState);

  /**
   * Get a deck (async)
   */
  useEffect(() => {
    deckDispatch({ type: 'get_a_deck' });
  }, []);

  /**
   * Render the deck
   */
  return (
    <DeckContext.Provider value={{ deckState, deckDispatch }}>
      <View>
        <WordCardContainer word={deckState.deck[deckState.currentIndex]} />
      </View>
    </DeckContext.Provider>
  );
}
