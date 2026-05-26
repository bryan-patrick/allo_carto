import CardDeckView from "@/src/components/CardDeck/CardDeckView";
import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";

/**
 * Deck view - A route wrapper in (routes)
 */
export default function Deck() {
  const { currentCard } = useCardDeck();

  return (
    <CardDeckView currentCard={currentCard} />
  )
}
